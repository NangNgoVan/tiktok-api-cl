import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
    UserAuthenticationMethod,
    UserAuthenticationMethodSchema,
} from 'src/shared/Schemas/user-authentication-method.schema'
import { User, UserSchema } from 'src/shared/Schemas/user.schema'
import { S3Service } from 'src/shared/Services/s3.service'
import { FeedsModule } from '../Feeds/feeds.module'
import { FollowsModule } from '../Follows/follows.module'
import { UsersController } from './Controller/users.controller'
import { UserAuthenticationMethodsService } from './Service/user-authentication-methods.service'
import { UsersService } from './Service/users.service'
import { UserFollowsController } from './Controller/user-follows.controller'
import { UserFeedsController } from './Controller/user-feeds.controller'
import { UserAuthenticationMethodsController } from './Controller/user-authentication-methods.controller'
import { AuthenticationModule } from '../Authentication/authentication.module'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            {
                name: UserAuthenticationMethod.name,
                schema: UserAuthenticationMethodSchema,
            },
        ]),
        forwardRef(() => FeedsModule),
        forwardRef(() => FollowsModule),
        forwardRef(() => AuthenticationModule),
    ],
    controllers: [
        UsersController,
        UserFollowsController,
        UserFeedsController,
        UserAuthenticationMethodsController,
    ],
    providers: [UsersService, UserAuthenticationMethodsService, S3Service],
    exports: [UsersService, UserAuthenticationMethodsService],
})
export class UsersModule {}