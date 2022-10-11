import { Module } from '@nestjs/common'
import { UsersController } from './Controller/users.controller'
import { UserAuthenticationMethodsRepository } from './Repository/user-authentication-methods.repository'
import { UsersRepository } from './Repository/users.repository'
import { ActionsRepository } from './Repository/actions.repository'
import { RolesRepository } from './Repository/roles.repository'
import { SubjectsRepository } from './Repository/subjects.repository'
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
import { UserRolesService } from './Service/user-roles.service'
import { RolesController } from './Controller/roles.controller'
import { UserRolesController } from './Controller/user-roles.controller'

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
    controllers: [UsersController, RolesController, UserRolesController],
    providers: [
        UserAuthenticationMethodsRepository,
        UsersRepository,
        ActionsRepository,
        RolesRepository,
        SubjectsRepository,
        RolesService,
        UsersService,
        UserRolesService,
        PermissionsService,
    ],
    exports: [
        UserAuthenticationMethodsRepository,
        UsersRepository,
        RolesRepository,
        ActionsRepository,
        SubjectsRepository,
        RolesService,
        UserRolesService,
        PermissionsService,
    ],
})
export class UsersModule {}
