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
import { FeedReactionsService } from 'src/ui/Reactions/Service/feed-reaction.service'

@Injectable()
export class FeedCommentService {
    constructor(
        @InjectModel(FeedComment.name)
        private commentModel: MongoPaging<FeedCommentDocument>,

        @InjectModel(Feed.name)
        private feedModel: Model<FeedDocument>,

        @InjectModel(User.name)
        private userModel: Model<UserDocument>,

        private readonly feedReactionService: FeedReactionsService,
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

        const comment = await this.commentModel.findOneAndUpdate(
            { _id: payload.reply_to },
            { $inc: { number_of_comment: 1 } },
        )
        if (!comment) throw new CommentNotFoundException()

        const createComment = await this.commentModel.create(payload)
        createComment.level = FeedCommentLevel.LEVEL_TWO

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

        if (comment.level === FeedCommentLevel.LEVEL_TWO) {
            return this.commentModel.deleteOne({ reply_to: commentId })
        }

        return this.commentModel.deleteMany({
            feed_id: feedId,
            reply_to: commentId,
        })
    }

    async getCommentByFeedId(
        feedId: string,
        currentUserId: string,
        next?: string,
        rowsPerpage = 6,
    ) {
        const feed = await this.feedModel.findById(feedId)
        if (!feed) throw new FeedNotFoundException()

        let feedComments = undefined
        if (!next) {
            feedComments = await this.commentModel.paginate({
                query: { feed_id: feedId, level: FeedCommentLevel.LEVEL_ONE },
                limit: rowsPerpage,
            })
        } else {
            feedComments = await this.commentModel.paginate({
                query: { feed_id: feedId, level: FeedCommentLevel.LEVEL_ONE },
                limit: rowsPerpage,
                next: next,
            })
        }

        let listUserInfo = null
        if (!_.isEmpty(feedComments.results)) {
            listUserInfo = await this.userModel.find({
                _id: _.uniq(_.map(feedComments.results, (it) => it.created_by)),
            })
        }

        feedComments.results = await Promise.all(
            feedComments.results.map(async (cmt) => {
                const userInfo = listUserInfo.find(
                    (u) => cmt.created_by === u.id,
                )
                const commentReaction =
                    await this.feedReactionService.getFeedReaction(
                        feedId,
                        currentUserId,
                    )
                return {
                    ..._.pick(cmt, [
                        '_id',
                        'feed_id',
                        'created_by',
                        'content',
                        'number_of_reaction',
                        'number_of_reply',
                        'created_at',
                        'updated_at',
                        'level',
                    ]),
                    current_user: {
                        is_reacted: !_.isEmpty(commentReaction) ? true : false,
                        reaction_type: _.get(commentReaction, 'type'),
                    },
                    created_user: _.pick(userInfo, [
                        '_id',
                        'full_name',
                        'avatar',
                        'nick_name',
                    ]),
                }
            }),
        )

        return feedComments
    }

    async getCommentByFeedIdAndCommentId(
        feedId: string,
        commentId: string,
        currentUserId: string,
        next?: string,
        rowsPerpage?: number,
    ) {
        const feed = await this.feedModel.findById(feedId)
        if (!feed) throw new FeedNotFoundException()

        const currentComment = await this.commentModel.find({
            feed_id: feedId,
            _id: commentId,
        })
        if (!currentComment) throw new CommentNotFoundException()

        if (!rowsPerpage) rowsPerpage = 5
        let feedComments = undefined
        if (!next) {
            feedComments = await this.commentModel.paginate({
                query: { reply_to: commentId },
                limit: rowsPerpage,
            })
        } else {
            feedComments = await this.commentModel.paginate({
                query: { reply_to: commentId },
                limit: rowsPerpage,
                next: next,
            })
        }

        let listUserInfo = null
        if (!_.isEmpty(feedComments.results)) {
            listUserInfo = await this.userModel.find({
                _id: _.uniq(_.map(feedComments.results, (it) => it.created_by)),
            })
        }

        feedComments.results = await Promise.all(
            feedComments.results.map(async (cmt) => {
                const userInfo = listUserInfo.find(
                    (u) => cmt.created_by === u.id,
                )
                const commentReaction =
                    await this.feedReactionService.getCommentReaction(
                        feedId,
                        cmt._id,
                        currentUserId,
                    )
                return {
                    ..._.pick(cmt, [
                        '_id',
                        'feed_id',
                        'created_by',
                        'content',
                        'number_of_reaction',
                        'number_of_reply',
                        'created_at',
                        'updated_at',
                    ]),
                    current_user: {
                        is_reacted: _.isEmpty(commentReaction) ? false : true,
                        reaction_type: _.get(commentReaction, 'type'),
                    },
                    created_user: _.pick(userInfo, [
                        '_id',
                        'full_name',
                        'nick_name',
                        'avatar',
                    ]),
                }
            }),
        )

        return feedComments
    }
}
