import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
    UserAuthenticationMethod,
    UserAuthenticationMethodSchema,
} from 'src/shared/Schemas/user-authentication-method.schema'
import { User, UserSchema } from 'src/shared/Schemas/user.schema'
import { AWS3FileUploadService } from 'src/shared/Services/aws-upload.service'
import { FollowsModule } from '../Follows/follows.module'
import { UserController } from './Controller/users.controller'
import { UserAuthenticationMethodsService } from './Service/user-authentication-methods.service'
import { UsersService } from './Service/users.service'
import { UserAuthenticationMethodsController } from './Controller/user-authentication-methods.controller'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            {
                name: UserAuthenticationMethod.name,
                schema: UserAuthenticationMethodSchema,
            },
        ]),
        FollowsModule,
    ],
    controllers: [UserController, UserAuthenticationMethodsController],
    providers: [
        UsersService,
        UserAuthenticationMethodsService,
        AWS3FileUploadService,
    ],
    exports: [UsersService, UserAuthenticationMethodsService],
})
export class UsersModule {}
