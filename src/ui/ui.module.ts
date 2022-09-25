import { Module } from '@nestjs/common'
import { AuthModule } from './Auth/auth.module'
import { UsersModule } from './Users/users.module'
import { InterestsModule } from './Interests/interests.module'
import { FeedsModule } from './Feeds/feeds.module'
import { CommentModule } from './Comments/comments.module'

@Module({
    imports: [
        AuthModule,
        UsersModule,
        InterestsModule,
        FeedsModule,
        CommentModule,
    ],
    controllers: [],
    providers: [],
})
export class UIModule {}
