import { MiddlewareConsumer, Module } from '@nestjs/common'
import { AuthModule } from './Auth/auth.module'
import { UsersModule } from './Users/users.module'
import { InterestsModule } from './Interests/interests.module'
import { FeedsModule } from './Feeds/feeds.module'
import { CommentsModule } from './Comments/comments.module'
import { BlacklistMiddleware } from 'src/shared/Middlewares/blacklist.middleware'
import { CacheService } from 'src/shared/Services/cache.service'
import { AuthService } from 'src/shared/Services/auth.service'
import { JwtService } from '@nestjs/jwt'
import { ReactionsModule } from './Reactions/reactions.module'
import { BookmarksModule } from './Bookmarks/bookmarks.module'
import { BlacklistTokenService } from 'src/shared/Services/blacklist-token.service'
@Module({
    imports: [
        AuthModule,
        UsersModule,
        InterestsModule,
        FeedsModule,
        CommentsModule,
        BookmarksModule,
        ReactionsModule,
    ],
    controllers: [],
    providers: [CacheService, AuthService, JwtService, BlacklistTokenService],
})
export class UIModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(BlacklistMiddleware)
            .forRoutes('ui/authentication/token', 'ui/authentication/logout')
    }
}
