import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
    CommentNotFoundException,
    FeedNotFoundException,
    ForbidenException,
} from 'src/shared/Exceptions/http.exceptions'
import { Feed, FeedDocument } from 'src/shared/Schemas/feed.schema'
import {
    FeedReaction,
    FeedReactionDocument,
} from 'src/shared/Schemas/feed-reaction.schema'
import {
    FeedCommentReaction,
    FeedCommentReactionDocument,
} from 'src/shared/Schemas/feed-comment-reaction.schema'
import { MongoPaging } from 'mongo-cursor-pagination'
import _ from 'lodash'
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
        private readonly FeedCommentReaction: MongoPaging<FeedCommentReactionDocument>,

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

        return this.feedReactionModel.create({
            feed_id,
            created_by,
            type: createReaction.type,
        })
    }

    async createReactionByFeedIdAndCommentId(
        feed_id: string,
        comment_id: string,
        created_by: string,
        createReaction: CreateFeedReactionDto,
    ) {
        const feed = await this.feedModel.findById(feed_id)
        if (!feed) throw new FeedNotFoundException()

        const comment = await this.commentModel.findOneAndUpdate(
            { _id: comment_id },
            { $inc: { number_of_reaction: 1 } },
        )
        if (!comment) throw new CommentNotFoundException()

        return this.FeedCommentReaction.create({
            feed_id,
            created_by,
            comment_id,
            type: createReaction.type,
        })
    }

    async deleteFeedReaction(feedId: string, currentUserId: string) {
        const feed = await this.feedModel.findOneAndUpdate(
            { _id: feedId },
            { $inc: { number_of_reaction: -1 } },
        )
        if (!feed) throw new FeedNotFoundException()

        if (feed.created_by !== currentUserId) {
            throw new ForbidenException()
        }

        return this.feedReactionModel.deleteOne({
            feed_id: feedId,
            created_by: currentUserId,
        })
    }

    async deleteFeedCommentReaction(
        feed_id: string,
        comment_id: string,
        currentUserId: string,
    ) {
        const feed = await this.feedModel.findById(feed_id)
        if (!feed) throw new FeedNotFoundException()

        const comment = await this.commentModel.findOneAndUpdate(
            { _id: comment_id },
            { $inc: { number_of_reaction: -1 } },
        )
        if (!comment) throw new CommentNotFoundException()

        if (comment.created_by !== currentUserId) {
            throw new ForbidenException()
        }

        return this.FeedCommentReaction.delete({
            comment_id,
            created_by: currentUserId,
        })
    }
}
