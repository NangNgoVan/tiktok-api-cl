import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
    FeedCommentReaction,
    FeedCommentReactionSchema,
} from 'src/shared/Schemas/feed-comment-reaction.schema'
import {
    FeedComment,
    FeedCommentSchema,
} from 'src/shared/Schemas/feed-comment.schema'
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
            {
                name: FeedCommentReaction.name,
                schema: FeedCommentReactionSchema,
            },
            { name: Feed.name, schema: FeedSchema },
            { name: FeedComment.name, schema: FeedCommentSchema },
        ]),
    ],
    controllers: [FeedReactionController],
    providers: [FeedReactionsService],
})
export class ReactionsModule {}
