import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
    FeedBookmark,
    FeedBookmarkSchema,
} from 'src/shared/Schemas/feed-bookmark.schema'
import { Feed, FeedSchema } from 'src/shared/Schemas/feed.schema'
import { BookmarksController } from './Controller/bookmarks.controller'
import { BookmarksService } from './Service/bookmarks.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: FeedBookmark.name, schema: FeedBookmarkSchema },
            { name: Feed.name, schema: FeedSchema },
        ]),
    ],
    controllers: [BookmarksController],
    providers: [BookmarksService],
    exports: [BookmarksService],
})
export class BookmarksModule {}
