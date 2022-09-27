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

    async getAllFollowersForUser(
        userId: string,
        next?: string,
        rowsPerpage?: number,
    ): Promise<GetUserFollowDto[]> {
        try {
            if (!rowsPerpage) rowsPerpage = 5
            let followers = undefined
            if (!next) {
                const followers = await this.userFollowModel.paginate({
                    query: { user_id: userId },
                    limit: rowsPerpage,
                })
            } else {
                followers = await this.userFollowModel.paginate({
                    query: { user_id: userId },
                    limit: rowsPerpage,
                    next: next,
                })
            }

            const followerDetails = await Promise.all(
                followers.map(async (id) => {
                    const user = await this.userModel.findById(id)
                    return {
                        user_id: id,
                        avatar: user.avatar,
                        nick_name: user.nick_name,
                        full_name: user.full_name,
                    } as GetUserFollowDto
                }),
            )
            followers.results = followerDetails

            return followers
        } catch {
            return []
        }
    }

    async getAllFollowingsForUser(
        userId: string,
        next?: string,
        rowsPerpage?: number,
    ): Promise<GetUserFollowDto[]> {
        try {
            if (!rowsPerpage) rowsPerpage = 5
            let followings = undefined
            if (!next) {
                followings = await this.userFollowModel.paginate({
                    query: { created_by: userId },
                    limit: rowsPerpage,
                })
            } else {
                followings = await this.userFollowModel.paginate({
                    query: { created_by: userId },
                    limit: rowsPerpage,
                    next: next,
                })
            }

            const followingDetails = await Promise.all(
                followings.results.map(async (followData) => {
                    const user = await this.userModel.findById(
                        followData.user_id,
                    )
                    return {
                        user_id: user.id,
                        avatar: user.avatar,
                        nick_name: user.nick_name,
                        full_name: user.full_name,
                    } as GetUserFollowDto
                }),
            )

            followings.results = followingDetails

            return followings
        } catch {
            return []
        }
    }

    async checkFollowRelationshipBetween(
        followerId: string,
        followingId: string,
    ): Promise<boolean> {
        if (
            await this.userFollowModel.findOne({
                created_by: followerId,
                user_id: followingId,
            })
        ) {
            return true
        }
        return false
    }
}
