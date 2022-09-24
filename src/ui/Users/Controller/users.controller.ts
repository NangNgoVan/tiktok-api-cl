import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Logger,
    Param,
    Post,
    Put,
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

@Controller('ui/users')
@ApiTags('User API')
export class UserController {
    private readonly logger: Logger = new Logger(UserController.name)

    constructor(
        private readonly userService: UsersService,
        private readonly aws3FileUploadService: AWS3FileUploadService,
    ) {}

    @Get('/current')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'get user by `current` alias' })
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
    @Put('/current')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'update user by `current` alias' })
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
    @ApiOperation({ summary: 'get user by user id' })
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
}
