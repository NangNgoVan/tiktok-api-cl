import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
    FeedHashTag,
    FeedHashTagSchema,
} from 'src/shared/Schemas/feed-hashtag.schema'
import { HashTag, HashTagSchema } from 'src/shared/Schemas/hashtag.schema'
import { FeedHashTagsService } from './Service/feed-hashtags.service'
import { HashTagService } from './Service/hashtags.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: FeedHashTag.name, schema: FeedHashTagSchema },
            { name: HashTag.name, schema: HashTagSchema },
        ]),
    ],
    providers: [FeedHashTagsService, HashTagService],
    exports: [FeedHashTagsService, HashTagService],
})
export class HashTagsModule {}
