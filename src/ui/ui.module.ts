import { MiddlewareConsumer, Module } from '@nestjs/common'
import { AuthModule } from './Auth/auth.module'
import { UsersModule } from './Users/users.module'
import { InterestsModule } from './Interests/interests.module'
import { FeedsModule } from './Feeds/feeds.module'
import { FeedCommentModule } from './Comments/feed-comments.module'
import { BlacklistMiddleware } from 'src/shared/Middlewares/blacklist.middleware'
import { RedisService } from 'src/shared/Services/redis.service'
import { AuthService } from 'src/shared/Services/auth.service'
import { JwtService } from '@nestjs/jwt'
@Module({
    imports: [
        AuthModule,
        UsersModule,
        InterestsModule,
        FeedsModule,
        FeedCommentModule,
    ],
    controllers: [],
    providers: [RedisService, AuthService, JwtService],
})
export class UIModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(BlacklistMiddleware)
            .forRoutes('ui/authentication/token', 'ui/authentication/logout')
    }
}
