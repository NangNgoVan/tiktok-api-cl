import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Comment, CommentSchema } from 'src/shared/Schemas/comment.schema'
import { Feed, FeedSchema } from 'src/shared/Schemas/feed.schema'
import { CommentController } from './Controller/comments.controller'
import { CommentService } from './Service/comment.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Comment.name, schema: CommentSchema },
            { name: Feed.name, schema: FeedSchema },
        ]),
    ],
    controllers: [CommentController],
    providers: [CommentService],
})
export class CommentModule {}
