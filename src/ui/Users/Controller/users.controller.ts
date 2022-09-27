import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Logger,
    Param,
    Patch,
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'

import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger'
import {
    DatabaseUpdateFailException,
    FileUploadFailException,
    UserNotFoundException,
} from 'src/shared/Exceptions/http.exceptions'
import { JwtAuthGuard } from 'src/shared/Guards/jwt.auth.guard'
import { UserDataResponse } from 'src/shared/Services/data-serializer.service'
import { HttpStatusResult } from 'src/shared/Types/types'
import { GetUserDto } from '../Dto/get-user.dto'
import { UpdateUserDto } from '../Dto/update-user.dto'
import { UsersService } from '../Service/users.service'
import { User, UserDocument } from '../../../shared/Schemas/user.schema'
import { FileInterceptor } from '@nestjs/platform-express'
import { AWS3FileUploadService } from 'src/shared/Services/aws-upload.service'
import { configService } from 'src/shared/Services/config.service'
import { UploadMetaDataDto } from '../Dto/upload-metadata.dto'
import moment from 'moment'
import { UserFollowsService } from 'src/ui/Follows/Service/user-follows.service'
import { GetUserFollowDto } from 'src/ui/Follows/Dto/get-user-follow.dto'
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator'
import { PaginateUserFollowsDto } from 'src/ui/Follows/Dto/paginate-user-follows.dto'

@Controller('ui/users')
@ApiTags('User APIs')
export class UserController {
    private readonly logger: Logger = new Logger(UserController.name)

    constructor(
        private readonly userService: UsersService,
        private readonly aws3FileUploadService: AWS3FileUploadService,
        private readonly userFollowsService: UserFollowsService,
    ) {}

    @Get('/current')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user by `current` alias' })
    @ApiOkResponse({
        description: '200',
        type: User,
    })
    async getCurrentUser(@Req() req): Promise<any> {
        const { userId } = req.user
        const user = await this.userService.findById(userId)
        return user
    }

    //Update current user
    @UseGuards(JwtAuthGuard)
    @Patch('/current')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update user by `current` alias' })
    @ApiOkResponse({
        description: '200',
    })
    @ApiNotFoundResponse()
    async updateCurrentUser(
        @Req() req,
        @Body() dto: UpdateUserDto,
    ): Promise<HttpStatusResult> {
        const { userId } = req.user
        const updatedUser = await this.userService.updateUser(userId, dto)

        if (!updatedUser) throw new BadRequestException()

        return {
            statusCode: 200,
            message: 'Update user success',
        }
    }

    //Get user by Id
    @Get('/:userId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user by user id' })
    @ApiOkResponse({
        description: '200',
        type: User,
    })
    @ApiNotFoundResponse()
    async getUserById(@Param() params): Promise<object> {
        const id = params.userId
        const user = await this.userService.findById(id)
        if (!user) throw new UserNotFoundException()
        //
        return user
    }

    // Upload avatar image
    @Post('/current/avatar')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiOperation({ summary: 'Upload avatar image' })
    @UseInterceptors(FileInterceptor('file'))
    @ApiOkResponse({
        description: 'Info about avatar',
        type: UploadMetaDataDto,
    })
    async uploadAvatarToAWS3(
        @UploadedFile() file: Express.Multer.File,
        @Req() req,
    ): Promise<UploadMetaDataDto> {
        const { userId } = req.user
        const user = await this.userService.findById(userId)
        if (!user) throw new UserNotFoundException()

        const { originalname, /*encoding,*/ mimetype, buffer, size } = file

        const path = 'avatars/' + moment().format('yyyy-MM-DD')

        const uploadedData =
            await this.aws3FileUploadService.uploadFileToS3Bucket(
                buffer,
                configService.getEnv('AWS_BUCKET_NAME'),
                originalname,
                mimetype,
                userId,
                path,
            )

        if (!uploadedData) throw new FileUploadFailException()

        const { /*ETag,*/ Location /*, Key, Bucket*/ } = uploadedData

        const avatarUrl = await this.userService.updateAvatar(userId, Location)

        if (!avatarUrl) throw new DatabaseUpdateFailException()

        const responseData = {
            url: Location,
            size: size,
        }

        return responseData
    }

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
    async getFollowings(@Req() req): Promise<GetUserFollowDto[]> {
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
    async getFollowersByUserId(@Req() req): Promise<GetUserFollowDto[]> {
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
    async getFollowingsByUserId(@Req() req): Promise<GetUserFollowDto[]> {
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
    async getFollowers(@Req() req): Promise<GetUserFollowDto[]> {
        const userId = req.params.userId
        let next = undefined
        if (req.query) next = req.query['next']
        return await this.userFollowsService.getAllFollowersForUser(
            userId,
            next,
        )
    }
}
