import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import {
    FeedResource,
    FeedResourceSchema,
} from 'src/shared/Schemas/feed-resource.schema'
import { Feed, FeedSchema } from 'src/shared/Schemas/feed.schema'
import { S3Service } from 'src/shared/Services/s3.service'
import { UtilsService } from 'src/shared/Services/utils.service'
import { UsersModule } from '../Users/users.module'
import { FeedController } from './Controller/feed.controller'
import { FeedResourceService } from './Service/feed-resource.service'
import { FeedService } from './Service/feed.service'
import { HashTagsModule } from '../Hashtags/hashtags.module'
import { FollowsModule } from '../Follows/follows.module'
import { ReactionsModule } from '../Reactions/reactions.module'
import { BookmarksModule } from '../Bookmarks/bookmarks.module'
import { FeedRepository } from './Repository/feed.repository'
import { FeedResourceRepository } from './Repository/feed-resource.repository'
import { FeedCreatorService } from './Service/feed-creator.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Feed.name, schema: FeedSchema },
            { name: FeedResource.name, schema: FeedResourceSchema },
        ]),
        forwardRef(() => UsersModule),
        HashTagsModule,
        FollowsModule,
        ReactionsModule,
        BookmarksModule,
    ],
    controllers: [FeedController],
    providers: [
        FeedRepository,
        FeedResourceRepository,
        FeedService,
        FeedResourceService,
        FeedCreatorService,
        S3Service,
        UtilsService,
    ],
    exports: [FeedService],
})
export class FeedsModule {}
