import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { FeedNotFoundException } from 'src/shared/Exceptions/http.exceptions'
import { Feed, FeedDocument } from 'src/shared/Schemas/feed.schema'
import {
    FeedReaction,
    FeedReactionDocument,
} from 'src/shared/Schemas/feed-reaction.schema'
import { MongoPaging } from 'mongo-cursor-pagination'
import _ from 'lodash'
import { CreateFeedReactionDto } from '../Dto/create-feed-reaction.dto'

@Injectable()
export class FeedReactionsService {
    constructor(
        @InjectModel(FeedReaction.name)
        private readonly feedReactionModel: MongoPaging<FeedReactionDocument>,

        @InjectModel(Feed.name)
        private readonly feedModel: Model<FeedDocument>,
    ) {}

    async createReactionByFeedId(createReaction: CreateFeedReactionDto) {
        const feed = await this.feedModel.findById(createReaction.feed_id)
        if (!feed) throw new FeedNotFoundException()

        await this.feedModel.findOneAndUpdate(
            { _id: createReaction.feed_id },
            { $inc: { number_of_reaction: 1 } },
        )

        return this.feedReactionModel.create(createReaction)
    }
}
