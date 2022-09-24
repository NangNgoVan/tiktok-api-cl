import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
    FeedResource,
    FeedResourceSchema,
} from 'src/shared/Schemas/feed-resource.schema'
import { Feed, FeedSchema } from 'src/shared/Schemas/feed.schema'
import { AWS3FileUploadService } from 'src/shared/Services/aws-upload.service'
import { UtilsService } from 'src/shared/Services/utils.service'
import { UsersModule } from '../Users/users.module'
import { FeedsController } from './Controller/feeds.controller'
import { FeedResourcesService } from '../Resources/Service/resources.service'
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
    providers: [
        FeedsService,
        FeedResourcesService,
        AWS3FileUploadService,
        UtilsService,
    ],
})
export class FeedsModule {}
