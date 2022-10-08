import { MiddlewareConsumer, Module } from '@nestjs/common'
import { AuthenticationModule } from './Authentication/authentication.module'
import { UsersModule } from './Users/users.module'
import { InterestsModule } from './Interests/interests.module'
import { FeedsModule } from './Feeds/feeds.module'
import { CommentsModule } from './Comments/comments.module'
import { RefreshTokenBlacklistMiddleware } from 'src/shared/Middlewares/refresh-token-blacklist-middleware.service'
import { CacheService } from 'src/shared/Services/cache.service'
import { AuthenticationService } from 'src/ui/Authentication/Service/authentication.service'
import { JwtService } from '@nestjs/jwt'
import { ReactionsModule } from './Reactions/reactions.module'
import { BookmarksModule } from './Bookmarks/bookmarks.module'
import { RefreshTokenBlacklistService } from 'src/shared/Services/refresh-token-blacklist.service'
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
            .forRoutes('ui/authentication/token', 'ui/authentication/logout')
    }
}
