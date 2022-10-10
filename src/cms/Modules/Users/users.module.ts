import { Module } from '@nestjs/common'
import { UsersController } from './Controller/users.controller'
import { UserAuthenticationMethodsRepository } from './Repositories/user-authentication-methods.repository'
import { UsersRepository } from './Repositories/users.repository'
import { ActionsRepository } from './Repositories/actions.repository'
import { RolesRepository } from './Repositories/roles.repository'
import { SubjectsRepository } from './Repositories/subjects.repository'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from '../../../shared/Schemas/user.schema'
import {
    UserAuthenticationMethod,
    UserAuthenticationMethodSchema,
} from '../../../shared/Schemas/user-authentication-method.schema'
import { Action, ActionSchema } from '../../../shared/Schemas/action.schema'
import { Subject, SubjectSchema } from '../../../shared/Schemas/subject.schema'
import { RolesService } from './Service/roles.service'
import { Role, RoleSchema } from '../../../shared/Schemas/role.schema'
import { UsersService } from './Service/users.service'
import { PermissionsService } from './Service/permissions.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            {
                name: UserAuthenticationMethod.name,
                schema: UserAuthenticationMethodSchema,
            },
            {
                name: Role.name,
                schema: RoleSchema,
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
    ],
    controllers: [UsersController],
    providers: [
        UserAuthenticationMethodsRepository,
        UsersRepository,
        ActionsRepository,
        RolesRepository,
        SubjectsRepository,
        RolesService,
        UsersService,
        PermissionsService,
    ],
    exports: [
        UserAuthenticationMethodsRepository,
        UsersRepository,
        RolesRepository,
        ActionsRepository,
        SubjectsRepository,
        RolesService,
        PermissionsService,
    ],
})
export class UsersModule {}
