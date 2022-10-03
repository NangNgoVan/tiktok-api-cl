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
import { FeedCommentReactionDocument } from 'src/shared/Schemas/feed-comment-reaction.schema'
import { MongoPaging } from 'mongo-cursor-pagination'
import { CreateFeedReactionDto } from '../Dto/create-feed-reaction.dto'
import {
    FeedComment,
    FeedCommentDocument,
} from 'src/shared/Schemas/feed-comment.schema'

@Injectable()
export class FeedReactionsService {
    constructor(
        @InjectModel(FeedReaction.name)
        private readonly feedReactionModel: MongoPaging<FeedReactionDocument>,
        @InjectModel(FeedReaction.name)
        private readonly feedCommentReaction: MongoPaging<FeedCommentReactionDocument>,
        @InjectModel(Feed.name)
        private readonly feedModel: Model<FeedDocument>,
        @InjectModel(FeedComment.name)
        private commentModel: MongoPaging<FeedCommentDocument>,
    ) {}

    async createReactionByFeedId(
        feed_id: string,
        created_by: string,
        createReaction: CreateFeedReactionDto,
    ) {
        const feed = await this.feedModel.findOneAndUpdate(
            { _id: feed_id },
            { $inc: { number_of_reaction: 1 } },
        )
        if (!feed) throw new FeedNotFoundException()

        const reaction = await this.feedReactionModel.findOne({
            created_by,
            feed_id,
        })

        if (reaction) {
            throw new BadRequestException('you already reacted to this feed')
        }

        const ret = await this.feedReactionModel.create({
            feed_id,
            created_by,
            type: createReaction.type,
        })

        // TODO: update increment o day

        return ret
    }

    async createReactionByFeedIdAndCommentId(
        feed_id: string,
        comment_id: string,
        created_by: string,
        createReaction: CreateFeedReactionDto,
    ) {
        const feed = await this.feedModel.findOne({
            feed_id,
        })
        if (!feed) throw new FeedNotFoundException()

        const comment = await this.commentModel.findOneAndUpdate(
            { _id: comment_id },
            { $inc: { number_of_reaction: 1 } },
        )
        if (!comment) throw new CommentNotFoundException()

        return this.feedCommentReaction.create({
            feed_id,
            created_by,
            comment_id,
            type: createReaction.type,
        })
    }

    async deleteFeedReaction(feedId: string, currentUserId: string) {
        const feed = await this.feedModel.findById(feedId)
        if (!feed) throw new FeedNotFoundException()

        await this.feedReactionModel.deleteOne({
            feed_id: feedId,
            created_by: currentUserId,
        })

        await this.feedModel.findOneAndUpdate(
            { _id: feedId },
            { $inc: { number_of_reaction: -1 } },
        )

        return 'OK'
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

        await this.feedCommentReaction.deleteOne({
            comment_id,
            created_by: currentUserId,
        })

        await this.commentModel.findOneAndUpdate(
            { _id: comment_id },
            { $inc: { number_of_reaction: -1 } },
        )

        return 'OK'
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
        return this.feedReactionModel.findOne({
            feed_id: feedId,
            comment_id: commentId,
            created_by: userId,
        })
    }

    async getCommentsReaction(
        feedId: string,
        commentId: string[],
        userId: string,
    ): Promise<FeedReactionDocument | undefined> {
        return this.feedReactionModel.find({
            feed_id: { $in: feedId },
            comment_id: commentId,
            created_by: userId,
        })
    }

    async getFeedReactions(
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
