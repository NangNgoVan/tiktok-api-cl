import { Injectable } from '@nestjs/common'
import { MongoPaging } from 'mongo-cursor-pagination'
import { InjectModel } from '@nestjs/mongoose'
import { Feed, FeedDocument } from 'src/shared/Schemas/feed.schema'
import { CreateFeedImageRequestDto } from '../RequestDTO/create-feed-image-request.dto'
import { CreateFeedVideoRequestDto } from '../RequestDTO/create-feed-video-request.dto'
import { FeedType } from 'src/shared/Types/types'

@Injectable()
export class FeedsRepository {
    constructor(
        @InjectModel(Feed.name)
        private readonly feedModel: MongoPaging<FeedDocument>,
    ) {}

    async createNewFeed(
        createFeedDto: CreateFeedImageRequestDto | CreateFeedVideoRequestDto,
    ): Promise<FeedDocument> {
        return this.feedModel.create(createFeedDto)
    }

    async getPaginatedFeeds(paginateOptions) {
        return this.feedModel.paginate(paginateOptions)
    }

    async findBy(options, sortBy?) {
        if (!sortBy) return this.feedModel.find(options)
        else return this.feedModel.find(options).sort(sortBy)
    }
}
