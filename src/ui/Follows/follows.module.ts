import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
    UserFollow,
    UserFollowSchema,
} from 'src/shared/Schemas/user-follow.schema'
import { User, UserSchema } from 'src/shared/Schemas/user.schema'
import { UserFollowsService } from './Service/user-follows.service'
import { S3Service } from '../../shared/Services/s3.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: UserFollow.name,
                schema: UserFollowSchema,
            },
            {
                name: User.name,
                schema: UserSchema,
            },
        ]),
    ],
    providers: [UserFollowsService, S3Service],
    exports: [UserFollowsService],
})
export class FollowsModule {}
