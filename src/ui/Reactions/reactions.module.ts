import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
    FeedReaction,
    FeedReactionSchema,
} from 'src/shared/Schemas/feed-reaction.schema'
import { Feed, FeedSchema } from 'src/shared/Schemas/feed.schema'
import { FeedReactionController } from './Controller/reactions.controller'
import { FeedReactionsService } from './Service/feed-reaction.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: FeedReaction.name, schema: FeedReactionSchema },
            { name: Feed.name, schema: FeedSchema },
        ]),
    ],
    controllers: [FeedReactionController],
    providers: [FeedReactionsService],
})
export class ReactionsModule {}
