import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
    UserFollow,
    UserFollowSchema,
} from 'src/shared/Schemas/user-follow.schema'
import { User, UserSchema } from 'src/shared/Schemas/user.schema'
import { AWS3FileUploadService } from 'src/shared/Services/aws-upload.service'
import { UserFollowsService } from '../Follows/Service/user-follows.service'
import { UserController } from './Controller/users.controller'
import { UsersService } from './Service/users.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: UserFollow.name, schema: UserFollowSchema },
        ]),
    ],
    controllers: [UserController],
    providers: [UsersService, AWS3FileUploadService, UserFollowsService],
    exports: [UsersService],
})
export class UsersModule {}
