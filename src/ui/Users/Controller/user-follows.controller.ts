import {
    Controller,
    Delete,
    Get,
    HttpStatus,
    Logger,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common'

import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger'
import {
    DatabaseUpdateFailException,
    UserNotFoundException,
} from 'src/shared/Exceptions/http.exceptions'
import { JwtAuthGuard } from 'src/shared/Guards/jwt.auth.guard'
import { HttpStatusResult } from 'src/shared/Types/types'
import { UpdateUserDto } from '../Dto/update-user.dto'
import { UsersService } from '../Service/users.service'
import { AWS3FileUploadService } from 'src/shared/Services/aws-upload.service'
import { UserFollowsService } from 'src/ui/Follows/Service/user-follows.service'
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator'
import { PaginateUserFollowsDto } from 'src/ui/Follows/Dto/paginate-user-follows.dto'

@Controller('ui/users')
@ApiTags('User Follow APIs')
export class UserFollowsController {
    constructor(
        private readonly userService: UsersService,
        private readonly aws3FileUploadService: AWS3FileUploadService,
        private readonly userFollowsService: UserFollowsService,
    ) {}

    @Post('/current/followings/:userId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Follow user by `current` alias and user id' })
    @ApiOkResponse({
        description: '200',
        schema: {
            properties: {
                statusCode: {
                    type: 'number',
                },
                message: {
                    type: 'string',
                },
            },
        },
    })
    async followingUser(@Req() req): Promise<HttpStatusResult> {
        const followingUserId = req.params.userId
        const followingUser = await this.userService.findById(followingUserId)
        if (!followingUser) throw new UserNotFoundException()

        const { userId } = req.user
        const followerUser = await this.userService.findById(userId)
        if (!followerUser) throw new UserNotFoundException()

        const followed = await this.userFollowsService.addFollowerForUser(
            followingUserId,
            userId,
        )

        if (!followed) throw new DatabaseUpdateFailException()

        await this.userService.updateUser(followingUserId, {
            number_of_follower: followingUser.number_of_follower + 1,
        } as UpdateUserDto)

        await this.userService.updateUser(userId, {
            number_of_following: followerUser.number_of_following + 1,
        } as UpdateUserDto)

        const responseData = {
            statusCode: HttpStatus.OK,
            message: 'Success!',
        }
        return responseData
    }

    @Delete('/current/followings/:userId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Unfollow user by `current` alias and user id' })
    @ApiOkResponse({
        description: '200',
        schema: {
            properties: {
                statusCode: {
                    type: 'number',
                },
                message: {
                    type: 'string',
                },
            },
        },
    })
    async unFollowingUser(@Req() req): Promise<HttpStatusResult> {
        const followingUserId = req.params.userId
        const followingUser = await this.userService.findById(followingUserId)
        if (!followingUser) throw new UserNotFoundException()

        const { userId } = req.user
        const followerUser = await this.userService.findById(userId)
        if (!followerUser) throw new UserNotFoundException()

        const unFollowed = await this.userFollowsService.removeFollowerFromUser(
            followingUserId,
            userId,
        )

        if (!unFollowed) throw new DatabaseUpdateFailException()

        let numberOfFollower = followingUser.number_of_follower - 1
        if (numberOfFollower < 0) numberOfFollower = 0
        await this.userService.updateUser(followingUserId, {
            number_of_follower: numberOfFollower,
        } as UpdateUserDto)

        let numberOfFollowing = followerUser.number_of_following - 1
        if (numberOfFollowing < 0) numberOfFollowing = 0
        await this.userService.updateUser(userId, {
            number_of_following: followerUser.number_of_following - 1,
        } as UpdateUserDto)

        const responseData = {
            statusCode: HttpStatus.OK,
            message: 'Success!',
        }
        return responseData
    }

    @Get('/current/followings')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get followings by `current` alias',
    })
    @ApiImplicitQuery({
        name: 'next',
        type: 'string',
        required: false,
    })
    @ApiOkResponse({
        type: PaginateUserFollowsDto,
    })
    async getFollowings(@Req() req): Promise<PaginateUserFollowsDto> {
        const { userId } = req.user
        let next = undefined
        if (req.query) next = req.query['next']
        return await this.userFollowsService.getAllFollowingsForUser(
            userId,
            next,
        )
    }

    @Get('/current/followers')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get followers by `current` alias',
    })
    @ApiImplicitQuery({
        name: 'next',
        type: 'string',
        required: false,
    })
    @ApiOkResponse({
        type: PaginateUserFollowsDto,
    })
    async getFollowersByUserId(@Req() req): Promise<PaginateUserFollowsDto> {
        const { userId } = req.user
        let next = undefined
        if (req.query) next = req.query['next']
        return await this.userFollowsService.getAllFollowersForUser(
            userId,
            next,
        )
    }

    @Get('/:userId/followings')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get followings by user id',
    })
    @ApiImplicitQuery({
        name: 'next',
        type: 'string',
        required: false,
    })
    @ApiOkResponse({
        type: PaginateUserFollowsDto,
    })
    async getFollowingsByUserId(@Req() req): Promise<PaginateUserFollowsDto> {
        const userId = req.params.userId
        let next = undefined
        if (req.query) next = req.query['next']
        return await this.userFollowsService.getAllFollowingsForUser(
            userId,
            next,
        )
    }

    @Get('/:userId/followers')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get followers by user id',
    })
    @ApiImplicitQuery({
        name: 'next',
        type: 'string',
        required: false,
    })
    @ApiOkResponse({
        type: PaginateUserFollowsDto,
    })
    async getFollowers(@Req() req): Promise<PaginateUserFollowsDto> {
        const userId = req.params.userId
        let next = undefined
        if (req.query) next = req.query['next']
        return await this.userFollowsService.getAllFollowersForUser(
            userId,
            next,
        )
    }
}
