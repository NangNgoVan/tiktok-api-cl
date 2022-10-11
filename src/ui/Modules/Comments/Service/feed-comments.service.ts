import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
    CommentNotFoundException,
    FeedNotFoundException,
    ForbidenException,
} from 'src/shared/Exceptions/http.exceptions'
import {
    FeedComment,
    FeedCommentDocument,
} from 'src/shared/Schemas/feed-comment.schema'
import { Feed, FeedDocument } from 'src/shared/Schemas/feed.schema'
import { User, UserDocument } from 'src/shared/Schemas/user.schema'
import { FeedCommentLevel } from 'src/shared/Types/types'
import { CreateFeedCommentDto } from '../Dto/create-feed-comment.dto'
import { MongoPaging } from 'mongo-cursor-pagination'
import _ from 'lodash'
import { ReactionsService } from 'src/ui/Modules/Reactions/Service/reaction.service'
import { S3Service } from '../../../../shared/Services/s3.service'
import { configService } from '../../../../shared/Services/config.service'

@Injectable()
export class FeedCommentService {
    constructor(
        @InjectModel(FeedComment.name)
        private commentModel: MongoPaging<FeedCommentDocument>,

        @InjectModel(Feed.name)
        private feedModel: Model<FeedDocument>,

        @InjectModel(User.name)
        private userModel: Model<UserDocument>,

        private readonly feedReactionService: ReactionsService,

        private readonly s3: S3Service,
    ) {}

    async createFeedComment(payload: CreateFeedCommentDto) {
        const feed = await this.feedModel.findById(payload.feed_id)
        if (!feed) throw new FeedNotFoundException()

        const createComment = await this.commentModel.create(payload)
        createComment.level = FeedCommentLevel.LEVEL_ONE

        await this.feedModel.findOneAndUpdate(
            { _id: payload.feed_id },
            { $inc: { number_of_comment: 1 } },
        )

        return createComment.save()
    }

    async createReplyComment(payload: CreateFeedCommentDto) {
        const feed = await this.feedModel.findById(payload.feed_id)
        if (!feed) throw new FeedNotFoundException()

        const comment = await this.commentModel.findById(payload.reply_to)
        if (!comment) throw new CommentNotFoundException()

        const createComment = await this.commentModel.create(payload)
        createComment.level = FeedCommentLevel.LEVEL_TWO

        await this.commentModel.findOneAndUpdate(
            { _id: payload.reply_to },
            { $inc: { number_of_reply: 1 } },
        )

        return createComment.save()
    }

    async deleteComment(
        feedId: string,
        commentId: string,
        currentUserId: string,
    ) {
        const feed = await this.feedModel.findById(feedId)
        if (!feed) throw new FeedNotFoundException()

        const comment = await this.commentModel.findById(commentId)
        if (!comment) throw new CommentNotFoundException()

        if (comment.created_by !== currentUserId) {
            throw new ForbidenException()
        }

        await this.commentModel.deleteOne({
            _id: commentId,
            created_by: currentUserId,
        })

        await this.commentModel.deleteMany({
            feed_id: feedId,
            reply_to: commentId,
        })

        if (feed.number_of_comment > 0) {
            await this.feedModel.findOneAndUpdate(
                { _id: feedId },
                { $inc: { number_of_comment: -1 } },
            )
        }
    }

    async getCommentByFeedId(
        feedId: string,
        currentUserId?: string,
        nextCursor?: string,
        perPage = 6,
    ) {
        const feed = await this.feedModel.findById(feedId)
        if (!feed) throw new FeedNotFoundException()

        const queryOption = {
            limit: perPage,
            next: nextCursor,
            query: { feed_id: feedId, level: FeedCommentLevel.LEVEL_ONE },
        }

        const paginatedComment = await this.commentModel.paginate(queryOption)

        const results = await this.buildComments(
            feedId,
            paginatedComment,
            currentUserId,
        )

        return {
            ...paginatedComment,
            results,
        }
    }

    async getCommentByFeedIdAndCommentId(
        feedId: string,
        commentId: string,
        currentUserId?: string,
        nextCursor?: string,
        perPage = 6,
    ) {
        const feed = await this.feedModel.findById(feedId)
        if (!feed) throw new FeedNotFoundException()

        const currentComment = await this.commentModel.find({
            feed_id: feedId,
            _id: commentId,
        })
        if (!currentComment) throw new CommentNotFoundException()

        const queryOption = {
            limit: perPage,
            next: nextCursor,
            query: {
                feed_id: feedId,
                level: FeedCommentLevel.LEVEL_TWO,
                reply_to: commentId,
            },
        }
        const paginatedComment = await this.commentModel.paginate(queryOption)

        const results = await this.buildComments(
            feedId,
            paginatedComment,
            currentUserId,
        )

        return {
            ...paginatedComment,
            results,
        }
    }

    async buildComments(
        feedId: string,
        paginatedComment: any,
        currentUserId?: string,
    ) {
        const comments = _.get(paginatedComment, 'results', [])

        const createdCommentUsers = await this.userModel.find({
            _id: _.uniq(
                _.compact(_.map(comments, (comment) => comment.created_by)),
            ),
        })

        const createdCommentUserAvatarObjectKeys: string[] = _.uniq(
            _.compact(_.map(createdCommentUsers, 'avatar')),
        )

        const avatarHashMap: Record<string, string | undefined> =
            await this.s3.getSignedUrls(
                createdCommentUserAvatarObjectKeys,
                configService.getEnv('AWS_BUCKET_NAME'),
                false,
            )

        const commentIds: string[] = _.map(comments, (comment) => comment._id)

        const commentReactionsByCurrentUser = currentUserId
            ? await this.feedReactionService.getCommentReactions(
                  feedId,
                  commentIds,
                  currentUserId,
              )
            : null

        return _.map(comments, (comment) => {
            const createdCommentUser: UserDocument | undefined = _.find(
                createdCommentUsers,
                (user) => user.id === comment.created_by,
            )

            const avatarKey: string | undefined = _.get(
                createdCommentUser,
                'avatar',
            )

            const avatar: string | undefined = _.get(avatarHashMap, avatarKey)

            return {
                ..._.pick(comment, [
                    '_id',
                    'feed_id',
                    'created_by',
                    'content',
                    'number_of_reaction',
                    'number_of_reply',
                    'created_at',
                    'updated_at',
                ]),
                current_user: this.getCurrentUserComment(
                    comment,
                    commentReactionsByCurrentUser,
                ),
                created_user: _.pick(
                    _.merge({}, createdCommentUser, { avatar }),
                    ['_id', 'full_name', 'nick_name', 'avatar'],
                ),
            }
        })
    }

    getCurrentUserComment(comment, commentReactionsByCurrentUser?) {
        if (!commentReactionsByCurrentUser) return null

        const currentCommentReaction = _.find(
            commentReactionsByCurrentUser,
            (commentReaction) =>
                commentReaction.comment_id === _.get(comment, '_id').toString(),
        )

        return {
            is_reacted: !!currentCommentReaction,
            reaction_type: _.get(currentCommentReaction, 'type'),
        }
    }
}