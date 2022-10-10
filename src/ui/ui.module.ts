import { MiddlewareConsumer, Module } from '@nestjs/common'
import { AuthenticationModule } from './Modules/Authentication/authentication.module'
import { UsersModule } from './Modules/Users/users.module'
import { InterestsModule } from './Modules/Interests/interests.module'
import { FeedsModule } from './Modules/Feeds/feeds.module'
import { CommentsModule } from './Modules/Comments/comments.module'
import { RefreshTokenBlacklistMiddleware } from 'src/shared/Middlewares/refresh-token-blacklist-middleware.service'
import { ReactionsModule } from './Modules/Reactions/reactions.module'
import { BookmarksModule } from './Modules/Bookmarks/bookmarks.module'
@Module({
    imports: [
        AuthenticationModule,
        UsersModule,
        InterestsModule,
        FeedsModule,
        CommentsModule,
        BookmarksModule,
        ReactionsModule,
    ],
    controllers: [],
    providers: [],
})
export class UIModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RefreshTokenBlacklistMiddleware)
            .forRoutes('ui/authentication/token')
    }
}
