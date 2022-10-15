import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpStatus,
    Param,
    ParseFilePipeBuilder,
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
    ApiTags,
} from '@nestjs/swagger'
import { UserNotFoundException } from 'src/shared/Exceptions/http.exceptions'
import { JwtAuthGuard } from 'src/shared/Guards/jwt-auth.guard'
import { HttpStatusResult } from 'src/shared/Types/types'
import { GetUserResponseDto } from '../ResponseDTO/get-user-response.dto'
import { UpdateUserRequestDto } from '../RequestDTO/update-user-request.dto'
import { UsersService } from '../Service/users.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { S3Service } from 'src/shared/Services/s3.service'
import { UserFollowsService } from 'src/ui/Modules/Follows/Service/user-follows.service'
import { AnonymousGuard } from 'src/shared/Guards/anonymous.guard'
import _ from 'lodash'
import { configService } from '../../../../shared/Services/config.service'
import { UploadMetaDataResponseDto } from 'src/shared/ResponseDTO/upload-metadata-response.dto'

@Controller('ui/users')
@ApiTags('Users APIs')
export class UsersController {
    constructor(
        private readonly userService: UsersService,
        private readonly s3Service: S3Service,
        private readonly userFollowsService: UserFollowsService,
    ) {}

    @Get('/current')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user by `current` alias' })
    @ApiOkResponse({
        type: GetUserResponseDto,
    })
    async getCurrentUser(@Req() req): Promise<GetUserResponseDto> {
        const { userId } = req.user

        const user = await this.userService.getById(userId)

        const avatar: string = await this.s3Service.getSignedUrl(
            user.avatar,
            configService.getEnv('AWS_BUCKET_NAME'),
            false,
        )

        return { ...user.toObject(), avatar }
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/current')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update user by `current` alias' })
    @ApiOkResponse()
    @ApiNotFoundResponse()
    async updateCurrentUser(
        @Req() req,
        @Body() dto: UpdateUserRequestDto,
    ): Promise<HttpStatusResult> {
        const { userId } = req.user

        await this.userService.update(userId, dto)

        return {
            statusCode: 200,
            message: 'Update user success',
        }
    }

    @Get('/:userId')
    @UseGuards(AnonymousGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user by user id' })
    @ApiOkResponse({
        type: GetUserResponseDto,
    })
    @ApiNotFoundResponse()
    async getUserById(
        @Param() params,
        @Req() req,
    ): Promise<GetUserResponseDto> {
        const id = _.get(params, 'userId')
        const userId = _.get(req.user, 'userId')
        const user = await this.userService.getById(id)
        if (!user) throw new UserNotFoundException()

        const avatar: string = await this.s3Service.getSignedUrl(
            user.avatar,
            configService.getEnv('AWS_BUCKET_NAME'),
            false,
        )

        if (id === userId) return { ...user.toObject(), avatar }

        const followed =
            await this.userFollowsService.checkFollowRelationshipBetween(
                userId,
                id,
            )

        const getUserDto = new GetUserResponseDto()
        getUserDto._id = user.id
        getUserDto.gender = user.gender
        getUserDto.number_of_follower = user.number_of_follower
        getUserDto.number_of_following = user.number_of_following
        getUserDto.number_of_feed = user.number_of_feed
        getUserDto.full_name = user.full_name
        getUserDto.nick_name = user.nick_name
        getUserDto.email = user.email
        getUserDto.avatar = avatar
        getUserDto.current_user = {
            is_followed: followed,
        }
        return getUserDto
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
        type: UploadMetaDataResponseDto,
    })
    async uploadAvatarToAWS3(
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: /(jpg|jpeg|png)$/,
                })
                .addMaxSizeValidator({
                    maxSize: 5 * 1024 * 1024,
                })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                }),
        )
        file: Express.Multer.File,
        @Req() req,
    ): Promise<UploadMetaDataResponseDto> {
        const { userId } = req.user
        return await this.userService.updateAvatar(userId, file)
    }
}
