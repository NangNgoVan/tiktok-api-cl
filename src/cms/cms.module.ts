import { Global, MiddlewareConsumer, Module } from '@nestjs/common'
import { AuthenticationModule } from './Modules/Authentication/authentication.module'
import { RefreshTokenBlacklistMiddleware } from '../shared/Middlewares/refresh-token-blacklist-middleware.service'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from '../shared/Schemas/user.schema'
import {
    UserAuthenticationMethod,
    UserAuthenticationMethodSchema,
} from '../shared/Schemas/user-authentication-method.schema'
import { Action, ActionSchema } from '../shared/Schemas/action.schema'
import { Subject, SubjectSchema } from '../shared/Schemas/subject.schema'
import { PermissionGuard } from './shared/Guards/permission.guard'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from '../shared/Guards/jwt-auth.guard'
import { UsersModule } from './Modules/Users/users.module'

@Module({
    imports: [AuthenticationModule, UsersModule],
    controllers: [],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: PermissionGuard,
        },
    ],
})
export class CMSModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RefreshTokenBlacklistMiddleware)
            .forRoutes('cms/authentication/token')
    }
}
