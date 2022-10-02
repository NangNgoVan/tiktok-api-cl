import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
    FeedComment,
    FeedCommentSchema,
} from 'src/shared/Schemas/feed-comment.schema'
import { User, UserSchema } from 'src/shared/Schemas/user.schema'
import { Feed, FeedSchema } from 'src/shared/Schemas/feed.schema'
import { FeedCommentsController } from './Controller/feed-comments.controller'
import { FeedCommentService } from './Service/feed-comments.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: FeedComment.name, schema: FeedCommentSchema },
            { name: Feed.name, schema: FeedSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [FeedCommentsController],
    providers: [FeedCommentService],
})
export class CommentsModule {}
