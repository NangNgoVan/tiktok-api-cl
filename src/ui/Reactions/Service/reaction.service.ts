import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
    CommentNotFoundException,
    FeedNotFoundException,
} from 'src/shared/Exceptions/http.exceptions'
import { Feed, FeedDocument } from 'src/shared/Schemas/feed.schema'
import {
    FeedReaction,
    FeedReactionDocument,
} from 'src/shared/Schemas/feed-reaction.schema'
import {
    FeedCommentReactionDocument,
    FeedCommentReaction,
} from 'src/shared/Schemas/feed-comment-reaction.schema'
import { MongoPaging } from 'mongo-cursor-pagination'
import { CreateFeedReactionDto } from '../Dto/create-feed-reaction.dto'
import {
    FeedComment,
    FeedCommentDocument,
} from 'src/shared/Schemas/feed-comment.schema'

@Injectable()
export class ReactionsService {
    constructor(
        @InjectModel(FeedReaction.name)
        private readonly feedReactionModel: MongoPaging<FeedReactionDocument>,

        @InjectModel(FeedCommentReaction.name)
        private readonly feedCommentReaction: MongoPaging<FeedCommentReactionDocument>,

        @InjectModel(Feed.name)
        private readonly feedModel: Model<FeedDocument>,

        @InjectModel(FeedComment.name)
        private commentModel: MongoPaging<FeedCommentDocument>,
    ) {}

    async createFeedReaction(
        feedId: string,
        currentUserId: string,
        createReaction: CreateFeedReactionDto,
    ) {
        const feed = await this.feedModel.findById(feedId)
        if (!feed) throw new FeedNotFoundException()

        const reaction = await this.feedReactionModel.findOne({
            created_by: currentUserId,
            feed_id: feedId,
        })

        if (reaction) {
            throw new BadRequestException('you already reacted to this feed')
        }

        const create = await this.feedReactionModel.create({
            feed_id: feedId,
            created_by: currentUserId,
            type: createReaction.type,
        })

        await this.feedModel.findOneAndUpdate(
            { _id: feedId },
            { $inc: { number_of_reaction: 1 } },
        )

        return create
    }

    async createCommentReaction(
        feed_id: string,
        comment_id: string,
        created_by: string,
        createReaction: CreateFeedReactionDto,
    ) {
        const feed = await this.feedModel.findById(feed_id)
        if (!feed) throw new FeedNotFoundException()

        const reaction = await this.feedCommentReaction.findOne({
            feed_id,
            created_by,
            comment_id,
        })

        if (reaction) {
            throw new BadRequestException('you already reacted to this feed')
        }

        const comment = await this.commentModel.findById(comment_id)
        if (!comment) throw new CommentNotFoundException()

        const createdComment = this.feedCommentReaction.create({
            feed_id,
            created_by,
            comment_id,
            type: createReaction.type,
        })

        await this.commentModel.findOneAndUpdate(
            { _id: comment_id },
            { $inc: { number_of_reaction: 1 } },
        )

        return createdComment
    }

    async deleteFeedReaction(feedId: string, currentUserId: string) {
        const feed = await this.feedModel.findById(feedId)
        if (!feed) throw new FeedNotFoundException()

        const deleteFeedReaction = await this.feedReactionModel.deleteOne({
            created_by: currentUserId,
            feed_id: feedId,
        })

        if (feed.number_of_reaction > 0) {
            await this.feedModel.findOneAndUpdate(
                { _id: feedId },
                { $inc: { number_of_reaction: -1 } },
            )
        }

        return deleteFeedReaction
    }

    async deleteFeedCommentReaction(
        feed_id: string,
        comment_id: string,
        currentUserId: string,
    ) {
        const feed = await this.feedModel.findById(feed_id)
        if (!feed) throw new FeedNotFoundException()

        const comment = await this.commentModel.findById(comment_id)
        if (!comment) throw new CommentNotFoundException()

        const deleteFeedCommentReaction =
            await this.feedCommentReaction.deleteOne({
                comment_id,
                created_by: currentUserId,
            })

        if (comment.number_of_reaction > 0) {
            await this.commentModel.findOneAndUpdate(
                { _id: comment_id },
                { $inc: { number_of_reaction: -1 } },
            )
        }

        return deleteFeedCommentReaction
    }

    async getFeedReaction(
        feedId: string,
        userId: string,
    ): Promise<FeedReactionDocument | undefined> {
        return this.feedReactionModel.findOne({
            feed_id: feedId,
            created_by: userId,
        })
    }

    async getCommentReaction(
        feedId: string,
        commentId: string,
        userId: string,
    ): Promise<FeedReactionDocument | undefined> {
        return this.feedCommentReaction.findOne({
            feed_id: feedId,
            comment_id: commentId,
            created_by: userId,
        })
    }

    async getCommentReactions(
        feedId: string,
        commentIds: string[],
        userId: string,
    ): Promise<FeedReactionDocument | undefined> {
        return this.feedCommentReaction.find({
            query: {
                feed_id: feedId,
                comment_id: { $in: commentIds },
                created_by: userId,
            },
        })
    }

    async getPaginatedFeedReactions(
        reactedBy: string,
        nextCursor?: string,
        perPage = 6,
    ) {
        const options = {
            limit: perPage,
            paginatedField: 'created_at',
            sortAscending: false,
            next: nextCursor,
            query: {
                created_by: reactedBy,
            },
        }

        return this.feedReactionModel.paginate(options)
    }
}
