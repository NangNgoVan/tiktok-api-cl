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

import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger'
import {
    DatabaseUpdateFailException,
    FileUploadFailException,
    UserNotFoundException,
} from 'src/shared/Exceptions/http.exceptions'
import { JwtAuthGuard } from 'src/shared/Guards/jwt.auth.guard'
import { HttpStatusResult } from 'src/shared/Types/types'
import { UserResponseDto } from '../ResponseDTO/user-response.dto'
import { UpdateUserDto } from '../RequestDTO/update-user.dto'
import { UsersService } from '../Service/users.service'
import { User } from '../../../shared/Schemas/user.schema'
import { FileInterceptor } from '@nestjs/platform-express'
import { AWS3FileUploadService } from 'src/shared/Services/aws-upload.service'
import { configService } from 'src/shared/Services/config.service'
import { UploadMetaDataDto } from '../RequestDTO/upload-metadata.dto'
import moment from 'moment'
import { UserFollowsService } from 'src/ui/Follows/Service/user-follows.service'
import { FeedsService } from 'src/ui/Feeds/Service/feeds.service'
import { v4 as uuidv4 } from 'uuid'

@Controller('ui/users')
@ApiTags('User APIs')
export class UsersController {
    private readonly logger: Logger = new Logger(UsersController.name)

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
        type: UserResponseDto,
    })
    async getCurrentUser(@Req() req): Promise<User> {
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
        type: UserResponseDto,
    })
    @ApiNotFoundResponse()
    async getUserById(@Param() params, @Req() req): Promise<any> {
        const id = params.userId
        const { userId } = req.user
        const user = await this.userService.findById(id)
        if (!user) throw new UserNotFoundException()

        if (id === userId) return user
        //
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
        getUserDto.avatar = user.avatar
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
                    fileType: /(jpg|jpeg|png|gif)$/,
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
        const { userId } = req.user
        const user = await this.userService.findById(userId)
        if (!user) throw new UserNotFoundException()

        const { originalname, /*encoding,*/ mimetype, buffer, size } = file

        const avatarResourcePath = 'avatars/' + moment().format('yyyy-MM-DD')
        const originalAvatarName = file.originalname
        const avatarExt = originalAvatarName.split('.').pop()
        const pathToSaveAvatar = `${avatarResourcePath}/${userId}/${uuidv4()}.${avatarExt}`

        const uploadedData =
            await this.aws3FileUploadService.uploadFileToS3Bucket(
                pathToSaveAvatar,
                buffer,
                mimetype,
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
}
