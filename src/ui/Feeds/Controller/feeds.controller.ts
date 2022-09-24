import {
    Body,
    Controller,
    Get,
    NotFoundException,
    Post,
    Req,
    UploadedFile,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import {
    ExpressAdapter,
    FileFieldsInterceptor,
    FileInterceptor,
    FilesInterceptor,
} from '@nestjs/platform-express'
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger'
import moment from 'moment'
import { dematerialize } from 'rxjs'
import {
    DatabaseUpdateFailException,
    UserNotFoundException,
} from 'src/shared/Exceptions/http.exceptions'
import { JwtAuthGuard } from 'src/shared/Guards/jwt.auth.guard'
import { Feed, FeedDocument } from 'src/shared/Schemas/feed.schema'
import { AWS3FileUploadService } from 'src/shared/Services/aws-upload.service'
import { configService } from 'src/shared/Services/config.service'
import { UtilsService } from 'src/shared/Services/utils.service'
import { FeedType } from 'src/shared/Types/types'
import { UsersService } from 'src/ui/Users/Service/users.service'
import { Logger } from 'winston'
import { AddFeedResourceDto } from '../../Resources/Dto/add-feed-resource.dto'
import { CreateFeedDto } from '../Dto/create-feed.dto'
import { FeedResourcesService } from '../../Resources/Service/resources.service'
import { FeedsService } from '../Service/feeds.service'
import { FeedDetailDto } from '../Dto/feed-detail.dto'

@Controller('ui/feeds')
@ApiTags('Feed APIs')
export class FeedsController {
    constructor(
        private readonly feedsService: FeedsService,
        private readonly feedResourcesService: FeedResourcesService,
        private readonly userService: UsersService,
        private readonly aws3FileUploadService: AWS3FileUploadService,
        private readonly utilsService: UtilsService,
    ) {}

    @Post('/by-type/image')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create new image feed by current user' })
    @UseInterceptors(FileFieldsInterceptor([{ name: 'resources' }]))
    @ApiOkResponse({
        description: 'OK',
        type: Feed,
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                resources: {
                    type: 'string',
                    format: 'binary',
                },
                data: {
                    type: 'object',
                    properties: {
                        content: {
                            type: 'string',
                        },
                        song_id: {
                            type: 'string',
                        },
                        primary_image_index: {
                            type: 'number',
                        },
                    },
                },
            },
        },
    })
    async uploadFeedImageType(
        @Req() req,
        @Body() formData: object,
        @UploadedFiles() files: { resources?: Express.Multer.File[] },
    ) {
        const { userId } = req.user
        const user = await this.userService.findById(userId)
        if (!user) throw new UserNotFoundException()

        const aws3FeedResourcePath = 'feeds/' + moment().format('yyyy-MM-DD')
        const resource_urls = await Promise.all(
            files.resources.map(async (file) => {
                const { originalname, /*encoding,*/ mimetype, buffer, size } =
                    file
                const uploadedData =
                    await this.aws3FileUploadService.uploadFileToS3Bucket(
                        buffer,
                        configService.getEnv('AWS_BUCKET_NAME'),
                        originalname,
                        mimetype,
                        userId,
                        aws3FeedResourcePath,
                    )
                if (!uploadedData) return null
                console.log(uploadedData)
                const { /*ETag,*/ /*Location ,*/ Key /*Bucket*/ } = uploadedData
                return Key
            }),
        )

        let data = null

        if (formData['data']) {
            data = JSON.parse(formData['data'])
        }

        const dto = data as CreateFeedDto
        dto.hashtags = this.utilsService.splitHashtagFromString(dto.content)

        dto.created_by = userId
        const createdFeed = await this.feedsService.createFeed(
            dto,
            FeedType.IMAGE,
        )
        if (!createdFeed) return DatabaseUpdateFailException

        const resourceDtos = resource_urls.map((url) => {
            return {
                path: url,
                feed_id: createdFeed.id,
                type: FeedType.IMAGE,
                created_by: userId,
            } as AddFeedResourceDto
        })

        const addedResources = await this.feedResourcesService.addFeedResource(
            resourceDtos,
        )
        if (!addedResources) return DatabaseUpdateFailException

        createdFeed.resource_id = addedResources
        await createdFeed.save()

        return createdFeed
    }
    @Get('/newest')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get newest feeds' })
    @ApiOkResponse({
        type: [FeedDetailDto],
    })
    async getNewestFeeds() {
        const feeds = await this.feedsService.getNewestFeed()
        return feeds
    }

    @Get('/:id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get feed detail' })
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'OK',
        type: FeedDetailDto,
    })
    async getFeedDetail(@Req() req): Promise<any> {
        const feedId = req.params.id
        console.log(feedId)
        const feed = await this.feedsService.getFeedDetail(feedId)
        if (!feed) throw new NotFoundException()
        return feed
    }
}
