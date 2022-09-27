import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import {
    UserFollow,
    UserFollowDocument,
} from 'src/shared/Schemas/user-follow.schema'
import { MongoPaging } from 'mongo-cursor-pagination'
import { User, UserDocument } from 'src/shared/Schemas/user.schema'
import { Model } from 'mongoose'
import { GetUserFollowDto } from '../Dto/get-user-follow.dto'

@Injectable()
export class UserFollowsService {
    constructor(
        @InjectModel(UserFollow.name)
        private readonly userFollowModel: MongoPaging<UserFollowDocument>,
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
    ) {}

    async addFollowerForUser(userId: string, followerId: string) {
        const followData = {
            user_id: userId,
            created_by: followerId,
        } as UserFollow

        let followedData = await this.userFollowModel.findOne(followData)

        if (followedData) return followedData

        followedData = await this.userFollowModel.create(followData)

        if (!followedData) return null

        return followedData
    }

    async removeFollowerFromUser(userId: string, unFollowerId: string) {
        const unfollowData = {
            user_id: userId,
            created_by: unFollowerId,
        } as UserFollow

        const unfollowedData = await this.userFollowModel.deleteOne(
            unfollowData,
        )

        if (!unfollowedData) return null

        return unfollowedData
    }

    async getAllFollowersForUser(userId: string): Promise<GetUserFollowDto[]> {
        const followerIds = (
            await this.userFollowModel.find({
                user_id: userId,
            })
        ).map((item) => item.created_by)

        const followers = await Promise.all(
            followerIds.map(async (id) => {
                const user = await this.userModel.findById(id)
                return {
                    user_id: id,
                    avatar: user.avatar,
                    nick_name: user.nick_name,
                    full_name: user.full_name,
                } as GetUserFollowDto
            }),
        )

        return followers
    }

    async getAllFollowingsForUser(userId: string): Promise<GetUserFollowDto[]> {
        const followingIds = (
            await this.userFollowModel.find({
                created_by: userId,
            })
        ).map((item) => item.user_id)

        const followers = await Promise.all(
            followingIds.map(async (id) => {
                const user = await this.userModel.findById(id)
                return {
                    user_id: id,
                    avatar: user.avatar,
                    nick_name: user.nick_name,
                    full_name: user.full_name,
                } as GetUserFollowDto
            }),
        )

        return followers
    }
}
