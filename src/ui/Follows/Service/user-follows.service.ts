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
import { PaginateUserFollowsDto } from '../Dto/paginate-user-follows.dto'
import { UserNotFoundException } from 'src/shared/Exceptions/http.exceptions'
import _ from 'lodash'

@Injectable()
export class UserFollowsService {
    constructor(
        @InjectModel(UserFollow.name)
        private readonly userFollowModel: MongoPaging<UserFollowDocument>,
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
    ) {}

    async addFollowerForUser(userId: string, followerId: string) {
        const followingUser = await this.userModel.findById(userId)
        if (!followingUser) throw new UserNotFoundException()
        const followerUser = await this.userModel.findById(followerId)
        if (!followerUser) throw new UserNotFoundException()

        const followData = {
            user_id: userId,
            created_by: followerId,
        } as UserFollow

        let followedData = await this.userFollowModel.findOne(followData)
        if (followedData) return followedData
        followedData = await this.userFollowModel.create(followData)

        if (!followedData) return null

        followingUser.$inc('number_of_follower', 1).save()
        followerUser.$inc('number_of_following', 1).save()

        return followedData
    }

    async removeFollowerFromUser(userId: string, unFollowerId: string) {
        const followingUser = await this.userModel.findById(userId)
        if (!followingUser) throw new UserNotFoundException()
        const followerUser = await this.userModel.findById(unFollowerId)
        if (!followerUser) throw new UserNotFoundException()

        const unfollowData = {
            user_id: userId,
            created_by: unFollowerId,
        } as UserFollow

        const unfollowedData = await this.userFollowModel.deleteOne(
            unfollowData,
        )

        if (!unfollowedData) return null

        if (followingUser.number_of_follower > 0)
            followingUser.$inc('number_of_follower', -1).save()
        if (followerUser.number_of_following > 0)
            followerUser.$inc('number_of_following', -1).save()

        return unfollowedData
    }

    async getAllFollowersForUser(
        userId: string,
        currentUserId?: string,
        nextCursor?: string,
        perPage = 6,
    ): Promise<PaginateUserFollowsDto> {
        try {
            const options = {
                limit: perPage,
                next: nextCursor,
                query: {
                    query: { user_id: userId },
                },
            }

            const followers = await this.userFollowModel.paginate(options)

            const followerIds = followers.results.map(
                (follower) => follower.created_by,
            )

            const followerDetails = await this.userModel.find(
                { _id: { $in: followerIds } },
                ['_id', 'nick_name', 'full_name', 'avatar'],
            )

            const followerDetailsWithCurrentUserData = await Promise.all(
                followerDetails.map(async (data) => {
                    const dto = new GetUserFollowDto()
                    dto._id = data._id
                    dto.nick_name = data.nick_name
                    dto.full_name = data.full_name
                    dto.avatar = data.avatar
                    dto.current_user = currentUserId
                        ? {
                              is_followed:
                                  await this.checkFollowRelationshipBetween(
                                      currentUserId,
                                      data._id,
                                  ),
                          }
                        : null
                    return dto
                }),
            )

            followers.results = followerDetailsWithCurrentUserData

            return followers
        } catch {
            return new PaginateUserFollowsDto()
        }
    }

    async getAllFollowingsForUser(
        userId: string,
        currentUserId?: string,
        nextCursor?: string,
        perPage = 5,
    ): Promise<PaginateUserFollowsDto> {
        try {
            const options = {
                limit: perPage,
                next: nextCursor,
                query: {
                    query: { created_by: userId },
                },
            }
            const followings = await this.userFollowModel.paginate(options)

            const followingIds = followings.results.map(
                (following) => following.user_id,
            )

            const followingDetails = await this.userModel.find(
                { _id: { $in: followingIds } },
                ['_id', 'nick_name', 'full_name', 'avatar'],
            )

            const followingDetailsWithCurrentUserData = await Promise.all(
                followingDetails.map(async (data) => {
                    const dto = new GetUserFollowDto()
                    dto._id = data._id
                    dto.nick_name = data.nick_name
                    dto.full_name = data.full_name
                    dto.avatar = data.avatar
                    dto.current_user = currentUserId
                        ? {
                              is_followed:
                                  await this.checkFollowRelationshipBetween(
                                      currentUserId,
                                      data._id,
                                  ),
                          }
                        : null
                    return dto
                }),
            )

            followings.results = followingDetailsWithCurrentUserData

            return followings
        } catch {
            return new PaginateUserFollowsDto()
        }
    }

    async getAllFollowingIdsByUserId(userId: string): Promise<string[]> {
        const followings = await this.userFollowModel.find({
            created_by: userId,
        })

        return _.map(followings, (following) => following.user_id)
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
