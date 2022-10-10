import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { FeedNotFoundException } from 'src/shared/Exceptions/http.exceptions'
import { Feed, FeedDocument } from 'src/shared/Schemas/feed.schema'
import { MongoPaging } from 'mongo-cursor-pagination'
import {
    FeedBookmarkDocument,
    FeedBookmark,
} from 'src/shared/Schemas/feed-bookmark.schema'

@Injectable()
export class BookmarksService {
    constructor(
        @InjectModel(FeedBookmark.name)
        private readonly feedBookmarkModel: MongoPaging<FeedBookmarkDocument>,
        @InjectModel(Feed.name)
        private readonly feedModel: Model<FeedDocument>,
    ) {}

    async createFeedBookmark(feedId: string, createdBy: string) {
        const feed = await this.feedModel.findById(feedId)
        if (!feed) throw new FeedNotFoundException()

        const feedBookmark = await this.feedBookmarkModel.findOne({
            feed_id: feedId,
            created_by: createdBy,
        })

        if (feedBookmark) {
            throw new BadRequestException('you already bookmarked this feed')
        }

        const createFeedBookmarks = await this.feedBookmarkModel.create({
            feed_id: feedId,
            created_by: createdBy,
        })

        await this.feedModel.findOneAndUpdate(
            { _id: feedId },
            { $inc: { number_of_bookmark: 1 } },
        )

        return createFeedBookmarks
    }

    async deleteFeedBookmark(feedId: string, createdBy: string) {
        const feedBookmark = await this.feedBookmarkModel.findOne({
            feed_id: feedId,
            created_by: createdBy,
        })

        if (!feedBookmark) throw new NotFoundException()

        const feed = await this.feedModel.findById(feedId)
        if (!feed) throw new FeedNotFoundException()

        await this.feedBookmarkModel.deleteOne({
            feed_id: feedId,
            created_by: createdBy,
        })

        if (feed.number_of_bookmark > 0) {
            await this.feedModel.findOneAndUpdate(
                { _id: feedId },
                { $inc: { number_of_bookmark: -1 } },
            )
        }
    }

    async getFeedBookmark(
        feedId: string,
        createdBy: string,
    ): Promise<FeedBookmarkDocument | undefined> {
        return this.feedBookmarkModel.findOne({
            feed_id: feedId,
            created_by: createdBy,
        })
    }

    async getFeedBookmarks(
        bookmarkedBy: string,
        nextCursor?: string,
        perPage = 6,
    ) {
        const options = {
            limit: perPage,
            paginatedField: 'created_at',
            sortAscending: false,
            next: nextCursor,
            query: {
                created_by: bookmarkedBy,
            },
        }

        return this.feedBookmarkModel.paginate(options)
    }
}
