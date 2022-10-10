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
import { ReactionsModule } from '../Reactions/reactions.module'
import { S3Service } from '../../../shared/Services/s3.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: FeedComment.name, schema: FeedCommentSchema },
            { name: Feed.name, schema: FeedSchema },
            { name: User.name, schema: UserSchema },
        ]),
        ReactionsModule,
    ],
    controllers: [FeedCommentsController],
    providers: [FeedCommentService, S3Service],
})
export class CommentsModule {}
