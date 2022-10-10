import { MiddlewareConsumer, Module } from '@nestjs/common'
import { AuthenticationModule } from './Modules/Authentication/authentication.module'
import { RefreshTokenBlacklistMiddleware } from '../shared/Middlewares/refresh-token-blacklist-middleware.service'
import { UsersModule } from './Modules/Users/users.module'

@Module({
    imports: [AuthenticationModule, UsersModule],
    controllers: [],
    providers: [
        // FIXME: this will apply to all application which is incorrect
        // we would like to apply these guards bellow just for cms module
        // {
        //     provide: APP_GUARD,
        //     useClass: JwtAuthGuard,
        // },
        // {
        //     provide: APP_GUARD,
        //     useClass: PermissionGuard,
        // },
    ],
})
export class CMSModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RefreshTokenBlacklistMiddleware)
            .forRoutes('cms/authentication/token')
    }
}
