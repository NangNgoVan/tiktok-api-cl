import { MiddlewareConsumer, Module } from '@nestjs/common'
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
import { UserAuthenticationMethodsRepository } from './shared/Repositories/User/user-authentication-methods.repository'
import { UsersRepository } from './shared/Repositories/User/users.repository'
import { SubjectsRepository } from './shared/Repositories/User/subjects.repository'
import { ActionsRepository } from './shared/Repositories/User/actions.repository'
import { RolesRepository } from './shared/Repositories/User/roles.repository'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            {
                name: UserAuthenticationMethod.name,
                schema: UserAuthenticationMethodSchema,
            },
            {
                name: Action.name,
                schema: ActionSchema,
            },
            {
                name: Subject.name,
                schema: SubjectSchema,
            },
            {
                name: Action.name,
                schema: ActionSchema,
            },
        ]),
        AuthenticationModule,
    ],
    controllers: [],
    providers: [
        UserAuthenticationMethodsRepository,
        UsersRepository,
        SubjectsRepository,
        ActionsRepository,
        RolesRepository,
    ],
})
export class CMSModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RefreshTokenBlacklistMiddleware)
            .forRoutes('cms/authentication/token')
    }
}
