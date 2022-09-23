import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
    FeedResource,
    FeedResourceSchema,
} from 'src/shared/Schemas/feed-resource.schema'
import { Feed, FeedSchema } from 'src/shared/Schemas/feed.schema'
import { UsersModule } from '../Users/users.module'
import { FeedsController } from './Controller/feeds.controller'
import { FeedResourcesService } from './Service/feed-resource.service'
import { FeedsService } from './Service/feeds.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Feed.name, schema: FeedSchema },
            { name: FeedResource.name, schema: FeedResourceSchema },
        ]),
        UsersModule,
    ],
    controllers: [FeedsController],
    providers: [FeedsService, FeedResourcesService],
})
export class FeedsModule {}
