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
import { configService } from '../../../../shared/Services/config.service'
import { S3Service } from '../../../../shared/Services/s3.service'

@Injectable()
export class UserFollowsService {
    constructor(
        @InjectModel(UserFollow.name)
        private readonly userFollowModel: MongoPaging<UserFollowDocument>,
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
        private readonly s3Service: S3Service,
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

    async getPaginatedFollowersByUserId(
        userId: string,
        currentUserId?: string,
        nextCursor?: string,
        perPage = 6,
    ): Promise<PaginateUserFollowsDto> {
        const paginatedUserFollow = await this.userFollowModel.paginate({
            limit: perPage,
            next: nextCursor,
            query: {
                user_id: userId,
            },
        })

        const userFollows = _.get(paginatedUserFollow, 'results', [])

        const createdByUserIds = userFollows.map(
            (userFollow) => userFollow.created_by,
        )

        const results = await this.buildUsers(createdByUserIds, currentUserId)

        return { ...paginatedUserFollow, results }
    }

    async getPaginatedFollowingByUserId(
        userId: string,
        currentUserId?: string,
        nextCursor?: string,
        perPage = 5,
    ): Promise<PaginateUserFollowsDto> {
        const paginatedUserFollow = await this.userFollowModel.paginate({
            limit: perPage,
            next: nextCursor,
            query: { created_by: userId },
        })

        const userFollows = _.get(paginatedUserFollow, 'results', [])

        const userIds = userFollows.map((userFollow) => userFollow.user_id)

        const results = await this.buildUsers(userIds, currentUserId)

        return { ...paginatedUserFollow, results }
    }

    async buildUsers(userIds: string[], currentUserId?: string) {
        const createdByUsers = await this.userModel.find(
            { _id: { $in: userIds } },
            ['_id', 'nick_name', 'full_name', 'avatar'],
        )

        return Promise.all(
            _.map(createdByUsers, async (user) => {
                const avatar = await this.s3Service.getSignedUrl(
                    user.avatar,
                    configService.getEnv('AWS_BUCKET_NAME'),
                    false,
                )

                const dto = new GetUserFollowDto()
                dto._id = user._id
                dto.nick_name = user.nick_name
                dto.full_name = user.full_name
                dto.avatar = avatar
                dto.current_user = currentUserId
                    ? {
                          is_followed:
                              await this.checkFollowRelationshipBetween(
                                  currentUserId,
                                  user._id,
                              ),
                      }
                    : null
                return dto
            }),
        )
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
