import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { DatabaseUpdateFailException } from 'src/shared/Exceptions/http.exceptions'
import { Feed, FeedDocument } from 'src/shared/Schemas/feed.schema'
import { FeedType } from 'src/shared/Types/types'
import { AddFeedResourceDto } from '../../Resources/Dto/add-feed-resource.dto'
import { CreateFeedDto } from '../Dto/create-feed.dto'
import { FeedDetailDto } from '../Dto/feed-detail.dto'
import { MongoPaging } from 'mongo-cursor-pagination'
import { FeedHashTagsService } from 'src/ui/Hashtags/Service/feed-hashtags.service'
import { HashTagService } from 'src/ui/Hashtags/Service/hashtags.service'

@Injectable()
export class FeedsService {
    constructor(
        @InjectModel(Feed.name)
        private readonly feedModel: MongoPaging<FeedDocument>,
        private readonly feedHashTagService: FeedHashTagsService,
        private readonly hashTagService: HashTagService,
    ) {}

    async createFeed(
        createFeedDto: CreateFeedDto,
        feedType: FeedType,
        resource_ids?: string[],
    ) {
        const createdFeed = await this.feedModel.create(createFeedDto)
        createdFeed.resource_id = resource_ids
        createdFeed.type = feedType

        /**await */ this.feedHashTagService.addFeedHashTag(
            createdFeed.id,
            createdFeed.created_by,
            createdFeed.hashtags,
        )
        /**await */ this.hashTagService.addHashTag(
            createdFeed.created_by,
            createdFeed.hashtags,
        )

        return createdFeed.save()
    }

    async getNewestFeed(next?: string, rowsPerpage?: number): Promise<object> {
        try {
            if (!rowsPerpage) rowsPerpage = 5
            if (!next) {
                return await this.feedModel.paginate({
                    limit: rowsPerpage,
                    paginatedField: 'created_at',
                })
            } else {
                return await this.feedModel.paginate({
                    limit: rowsPerpage,
                    next: next,
                    paginatedField: 'created_at',
                })
            }
        } catch {
            //throw or return empty
            return []
        }
    }

    async getFeedDetail(feedId: string) {
        return await this.feedModel.findById(feedId)
    }
}
