import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpStatus,
    Logger,
    Param,
    ParseFilePipeBuilder,
    Patch,
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { fromBuffer } from 'file-type'

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
import { JwtAuthGuard } from 'src/shared/Guards/jwt.auth.guard'
import { HttpStatusResult } from 'src/shared/Types/types'
import { UserResponseDto } from '../ResponseDTO/user-response.dto'
import { UpdateUserDto } from '../RequestDTO/update-user.dto'
import { UsersService } from '../Service/users.service'
import { User } from '../../../shared/Schemas/user.schema'
import { FileInterceptor } from '@nestjs/platform-express'
import { S3Service } from 'src/shared/Services/s3.service'
import { UploadMetaDataDto } from '../RequestDTO/upload-metadata.dto'
import moment from 'moment'
import { UserFollowsService } from 'src/ui/Follows/Service/user-follows.service'
import { v4 as uuidv4 } from 'uuid'
import { AnonymousGuard } from 'src/shared/Guards/anonymous.guard'
import _ from 'lodash'
import { configService } from '../../../shared/Services/config.service'

@Controller('ui/users')
@ApiTags('User APIs')
export class UsersController {
    private readonly logger: Logger = new Logger(UsersController.name)

    constructor(
        private readonly userService: UsersService,
        private readonly s3: S3Service,
        private readonly userFollowsService: UserFollowsService,
    ) {}

    @Get('/current')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user by `current` alias' })
    @ApiOkResponse({
        description: '200',
        type: UserResponseDto,
    })
    async getCurrentUser(@Req() req): Promise<User> {
        const { userId } = req.user

        const user = await this.userService.findById(userId)

        const avatar: string = await this.s3.getSignedUrl(
            user.avatar,
            configService.getEnv('AWS_BUCKET_NAME'),
            false,
        )

        return { ...user, avatar }
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
    @UseGuards(AnonymousGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user by user id' })
    @ApiOkResponse({
        description: '200',
        type: UserResponseDto,
    })
    @ApiNotFoundResponse()
    async getUserById(@Param() params, @Req() req): Promise<any> {
        const id = _.get(params, 'userId')
        const userId = _.get(req.user, 'userId')
        const user = await this.userService.findById(id)
        if (!user) throw new UserNotFoundException()

        const avatar: string = await this.s3.getSignedUrl(
            user.avatar,
            configService.getEnv('AWS_BUCKET_NAME'),
            false,
        )

        if (id === userId) return { ...user, avatar }

        const followed =
            await this.userFollowsService.checkFollowRelationshipBetween(
                userId,
                id,
            )

        const getUserDto = new UserResponseDto()
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
        type: UploadMetaDataDto,
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
    ): Promise<UploadMetaDataDto> {
        // FIXME: move this to service

        const { userId } = req.user

        const user = await this.userService.findById(userId)

        if (!user) throw new UserNotFoundException()

        const { buffer, size } = file

        const { ext, mime: mimetype } = await fromBuffer(buffer)

        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(mimetype)) {
            throw new BadRequestException(
                `mime type ${mimetype} is not supported`,
            )
        }

        // FIXME: delete old avatar before update new one
        const avatarObjectKey = `avatars/${moment().format(
            'yyyy-MM-DD',
        )}/${userId}/${uuidv4()}.${ext}`

        const { Key } = await this.s3.uploadFileToS3Bucket(
            avatarObjectKey,
            mimetype,
            buffer,
        )

        const [url] = await Promise.all([
            this.s3.getSignedUrl(
                Key,
                configService.getEnv('AWS_BUCKET_NAME'),
                false,
            ),
            this.userService.updateAvatar(userId, Key),
        ])

        return {
            url,
            size: size,
        }
    }
}
