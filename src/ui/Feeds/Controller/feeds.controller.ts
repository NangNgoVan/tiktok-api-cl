import {
    Body,
    Controller,
    Get,
    NotFoundException,
    Post,
    Query,
    Req,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger'
import moment from 'moment'
import {
    DatabaseUpdateFailException,
    UserNotFoundException,
} from 'src/shared/Exceptions/http.exceptions'
import { JwtAuthGuard } from 'src/shared/Guards/jwt.auth.guard'
import { Feed } from 'src/shared/Schemas/feed.schema'
import { AWS3FileUploadService } from 'src/shared/Services/aws-upload.service'
import { configService } from 'src/shared/Services/config.service'
import { UtilsService } from 'src/shared/Services/utils.service'
import { FeedType } from 'src/shared/Types/types'
import { UsersService } from 'src/ui/Users/Service/users.service'
import { AddFeedResourceDto } from '../../Resources/Dto/add-feed-resource.dto'
import { CreateFeedDto } from '../Dto/create-feed.dto'
import { FeedResourcesService } from '../../Resources/Service/resources.service'
import { FeedsService } from '../Service/feeds.service'
import { FeedDetailDto } from '../Dto/feed-detail.dto'
import { PaginateFeedResultsDto } from '../Dto/paginate-feed-results.dto'
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator'
import { FeedCurrentUserDto } from '../Dto/feed-current-user.dto'
import { CreatedUserDto } from '../../../shared/Dto/created-user.dto'
import _ from 'lodash'

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
    @ApiOperation({ summary: 'Create image feed' })
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
                const { /*ETag,*/ /*Location ,*/ Key /*Bucket*/ } = uploadedData
                return Key
            }),
        )

        let data = null

        if (formData['data']) {
            data = JSON.parse(formData['data'])
        }

        let dto = data as CreateFeedDto
        dto = _.pick(dto, [
            'content',
            'song_id',
            'hashtags',
            'created_by',
            'primary_image_index',
            'allow_comment',
        ])
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

        createdFeed.resource_ids = addedResources
        await createdFeed.save()

        return createdFeed
    }

    @Get('/newest')
    @UseGuards(JwtAuthGuard)
    @ApiQuery({
        name: 'next',
        type: 'string',
        required: false,
    })
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get newest feeds' })
    @ApiOkResponse({
        type: PaginateFeedResultsDto,
    })
    @ApiImplicitQuery({
        required: false,
        name: 'next',
        type: String,
    })
    async getNewestFeeds(@Query() query, @Req() req) {
        let next = undefined
        if (query) next = query['next']
        const { userId } = req.user
        const feeds = await this.feedsService.getNewestFeed(userId, next)
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
        const feed = await this.feedsService.getFeedDetail(feedId)
        if (!feed) throw new NotFoundException()
        return feed
    }
}
