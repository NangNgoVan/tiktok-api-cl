import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Comment, CommentSchema } from 'src/shared/Schemas/comment.schema'
import { User, UserSchema } from 'src/shared/Schemas/user.schema'
import { Feed, FeedSchema } from 'src/shared/Schemas/feed.schema'
import { CommentController } from './Controller/comments.controller'
import { CommentService } from './Service/comment.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Comment.name, schema: CommentSchema },
            { name: Feed.name, schema: FeedSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [CommentController],
    providers: [CommentService],
})
export class CommentModule {}
