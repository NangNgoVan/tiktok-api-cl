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
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger'
import { DatabaseUpdateFailException } from 'src/shared/Exceptions/http.exceptions'
import { JwtAuthGuard } from 'src/shared/Guards/jwt.auth.guard'
import { HttpStatusResult } from 'src/shared/Types/types'
import { UsersService } from '../Service/users.service'
import { S3Service } from 'src/shared/Services/s3.service'
import { UserFollowsService } from 'src/ui/Follows/Service/user-follows.service'
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator'
import { PaginateUserFollowsDto } from 'src/ui/Follows/Dto/paginate-user-follows.dto'
import { AnonymousGuard } from 'src/shared/Guards/anonymous.guard'
import _ from 'lodash'

@Controller('ui/users')
@ApiTags('User Follow APIs')
export class UserFollowsController {
    constructor(
        private readonly userService: UsersService,
        private readonly aws3FileUploadService: S3Service,
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
        const { userId } = req.user

        const followed = await this.userFollowsService.addFollowerForUser(
            followingUserId,
            userId,
        )
        if (!followed) throw new DatabaseUpdateFailException()

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

        const { userId } = req.user

        const unFollowed = await this.userFollowsService.removeFollowerFromUser(
            followingUserId,
            userId,
        )

        if (!unFollowed) throw new DatabaseUpdateFailException()

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
        const currentUserId = _.get(req.user, 'userId')
        let next = undefined
        if (req.query) next = req.query['next']
        return await this.userFollowsService.getPaginatedFollowingByUserId(
            currentUserId,
            currentUserId,
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
        const currentUserId = _.get(req.user, 'userId')
        let next = undefined
        if (req.query) next = req.query['next']
        return await this.userFollowsService.getPaginatedFollowersByUserId(
            currentUserId,
            currentUserId,
            next,
        )
    }

    @Get('/:userId/followings')
    @UseGuards(AnonymousGuard)
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
    @ApiNotFoundResponse()
    async getFollowingsByUserId(@Req() req): Promise<PaginateUserFollowsDto> {
        const userId = _.get(req.params, 'userId')
        const currentUserId = _.get(req.user, 'userId')
        const nextCursor: string | undefined = req.query['next']

        return await this.userFollowsService.getPaginatedFollowingByUserId(
            userId,
            currentUserId,
            nextCursor,
        )
    }

    @Get('/:userId/followers')
    @UseGuards(AnonymousGuard)
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
        const userId = _.get(req.params, 'userId')
        const currentUserId = _.get(req.user, 'userId')
        const nextCursor: string | undefined = req.query['next']

        return await this.userFollowsService.getPaginatedFollowersByUserId(
            userId,
            currentUserId,
            nextCursor,
        )
    }
}
