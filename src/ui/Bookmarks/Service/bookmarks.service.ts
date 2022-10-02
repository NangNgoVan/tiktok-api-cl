import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { FeedNotFoundException } from 'src/shared/Exceptions/http.exceptions'
import { Feed, FeedDocument } from 'src/shared/Schemas/feed.schema'
import _ from 'lodash'
import {
    FeedBookmarkDocument,
    FeedBookmark,
} from 'src/shared/Schemas/feed-bookmark.schema'

@Injectable()
export class BookmarksService {
    constructor(
        @InjectModel(FeedBookmark.name)
        private readonly feedBookmarkModel: Model<FeedBookmarkDocument>,

        @InjectModel(Feed.name)
        private readonly feedModel: Model<FeedDocument>,
    ) {}

    async createBookmarkByFeedId(feed_id: string, created_by: string) {
        const feed = await this.feedModel.findOneAndUpdate(
            { _id: feed_id },
            { $inc: { number_of_bookmark: 1 } },
        )

        if (!feed) throw new FeedNotFoundException()

        const feedBookmark = await this.feedBookmarkModel.findOne({
            feed_id,
            created_by,
        })

        if (feedBookmark) {
            throw new BadRequestException('you already bookmarked this feed')
        }

        return this.feedBookmarkModel.create({
            feed_id,
            created_by,
        })
    }

    async deleteBookmark(feedId: string, currentUserId: string) {
        const feedBookmark = await this.feedBookmarkModel.findOne({
            feed_id: feedId,
            user_id: currentUserId,
        })
        if (!feedBookmark) throw new NotFoundException()

        const feed = await this.feedModel.findOneAndUpdate(
            { _id: feedId },
            { $inc: { number_of_bookmark: -1 } },
        )
        if (!feed) throw new FeedNotFoundException()

        return this.feedBookmarkModel.deleteOne({
            feed_id: feedId,
            created_by: currentUserId,
        })
    }

    async getFeedsBookmarkedByUser(userId: string): Promise<any> {
        try {
            return await this.feedBookmarkModel.find({
                created_by: userId,
            })
        } catch {
            return []
        }
    }
}
