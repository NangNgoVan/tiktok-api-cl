import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
    UserAuthenticationMethod,
    UserAuthenticationMethodSchema,
} from 'src/shared/Schemas/user-authentication-method.schema'
import {
    UserFollow,
    UserFollowSchema,
} from 'src/shared/Schemas/user-follow.schema'
import { User, UserSchema } from 'src/shared/Schemas/user.schema'
import { AWS3FileUploadService } from 'src/shared/Services/aws-upload.service'
import { FollowsModule } from '../Follows/follows.module'
import { UserFollowsService } from '../Follows/Service/user-follows.service'
import { UserController } from './Controller/users.controller'
import { UserAuthenticationMethodsService } from './Service/user-authentication-methods.service'
import { UsersService } from './Service/users.service'

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
    controllers: [UserController],
    providers: [
        UsersService,
        UserAuthenticationMethodsService,
        AWS3FileUploadService,
    ],
    exports: [UsersService, UserAuthenticationMethodsService],
})
export class UsersModule {}
