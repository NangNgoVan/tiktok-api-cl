import { Injectable } from '@nestjs/common'
import { MongoPaging } from 'mongo-cursor-pagination'
import { InjectModel } from '@nestjs/mongoose'
import { Feed, FeedDocument } from 'src/shared/Schemas/feed.schema'

@Injectable()
export class FeedRepository {
    constructor(
        @InjectModel(Feed.name)
        private readonly feedModel: MongoPaging<FeedDocument>,
    ) {}

    async create(feedDocument: Feed): Promise<FeedDocument> {
        return this.feedModel.create(feedDocument)
    }

    async delete(id: string) {
        return this.feedModel.deleteOne({
            _id: id,
        })
    }

    async getPaginatedFeeds(paginateOptions) {
        return this.feedModel.paginate(paginateOptions)
    }

    async findBy(options, sortBy?) {
        if (!sortBy) return this.feedModel.find(options)
        else return this.feedModel.find(options).sort(sortBy)
    }
}
