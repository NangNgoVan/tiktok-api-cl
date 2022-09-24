import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { DatabaseUpdateFailException } from 'src/shared/Exceptions/http.exceptions'
import { Feed, FeedDocument } from 'src/shared/Schemas/feed.schema'
import { FeedType } from 'src/shared/Types/types'
import { AddFeedResourceDto } from '../../Resources/Dto/add-feed-resource.dto'
import { CreateFeedDto } from '../Dto/create-feed.dto'
import { FeedDetailDto } from '../Dto/feed-detail.dto'

@Injectable()
export class FeedsService {
    constructor(
        @InjectModel(Feed.name)
        private feedModel: Model<FeedDocument>,
    ) {}

    async createFeed(
        createFeedDto: CreateFeedDto,
        feedType: FeedType,
        resource_ids?: string[],
    ) {
        const createdFeed = await this.feedModel.create(createFeedDto)
        createdFeed.resource_id = resource_ids
        createdFeed.type = feedType
        return createdFeed.save()
    }

    async getNewestFeed(): Promise<object> {
        return await this.feedModel.find({})
    }

    async getFeedDetail(feedId: string) {
        return await this.feedModel.findById(feedId)
    }
}
