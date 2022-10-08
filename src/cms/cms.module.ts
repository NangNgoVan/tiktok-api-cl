import { MiddlewareConsumer, Module } from '@nestjs/common'
import { AuthenticationModule } from './Authentication/authentication.module'
import { RefreshTokenBlacklistMiddleware } from '../shared/Middlewares/refresh-token-blacklist-middleware.service'

@Module({
    imports: [AuthenticationModule],
    controllers: [],
    providers: [],
})
export class CMSModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RefreshTokenBlacklistMiddleware)
            .forRoutes('cms/authentication/token')
    }
}
