import {
    Body,
    Controller,
    Get,
    HttpStatus,
    ParseFilePipeBuilder,
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
    FileUploadFailException,
    UserNotFoundException,
} from 'src/shared/Exceptions/http.exceptions'
import { JwtAuthGuard } from 'src/shared/Guards/jwt.auth.guard'
import { S3Service } from 'src/shared/Services/s3.service'
import { UtilsService } from 'src/shared/Services/utils.service'
import { FeedType } from 'src/shared/Types/types'
import { UsersService } from 'src/ui/Users/Service/users.service'
import { AddFeedResourceDto } from '../../Resources/Dto/add-feed-resource.dto'
import { CreateFeedImageDto } from '../Dto/create-feed-image.dto'
import { FeedResourcesService } from '../../Resources/Service/resources.service'
import { FeedsService } from '../Service/feeds.service'
import { FeedDetailDto } from '../Dto/feed-detail.dto'
import { PaginateFeedResultsDto } from '../Dto/paginate-feed-results.dto'
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator'
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { FeedVideoValidationPipe } from 'src/shared/Pipes/feed-video-validation-pipe.service'
import { CreateFeedVideoDto } from '../Dto/create-feed-video.dto'
import { AnonymousGuard } from 'src/shared/Guards/anonymous.guard'

@Controller('ui/feeds')
@ApiTags('Feed APIs')
export class FeedsController {
    constructor(
        private readonly feedsService: FeedsService,
        private readonly feedResourcesService: FeedResourcesService,
        private readonly userService: UsersService,
        private readonly aws3FileUploadService: S3Service,
        private readonly utilsService: UtilsService,
    ) {}

    @Post('/by-type/image')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create image feed' })
    @UseInterceptors(FileFieldsInterceptor([{ name: 'resources' }]))
    @ApiOkResponse({
        description: 'OK',
        type: FeedDetailDto,
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
                        allowed_comment: {
                            type: 'boolean',
                        },
                    },
                },
            },
        },
    })
    async uploadFeedImageType(
        @Req() req,
        @Body() formData: object,
        @UploadedFiles(
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
        files: { resources?: Express.Multer.File[] },
    ) {
        const { userId } = req.user
        const user = await this.userService.findById(userId)
        if (!user) throw new UserNotFoundException()

        let dto = formData['data'] as CreateFeedImageDto

        dto = _.pick(dto, [
            'content',
            'song_id',
            'hashtags',
            'created_by',
            'primary_image_index',
            'allowed_comment',
        ])

        dto.hashtags = this.utilsService.splitHashtagFromString(dto.content)

        dto.created_by = userId
        const createdFeed = await this.feedsService.createFeed(
            dto,
            FeedType.IMAGE,
        )
        if (!createdFeed) return DatabaseUpdateFailException

        const objectKeyPrefix = 'feed-images/' + moment().format('yyyy-MM-DD')

        const resource_urls = await Promise.all(
            files.resources.map(async (file) => {
                const { originalname, /*encoding,*/ mimetype, buffer } = file
                const ext = originalname.split('.').pop()
                const pathToSaveResource = `${objectKeyPrefix}/${userId}/${uuidv4()}.${ext}`

                const uploadedData =
                    await this.aws3FileUploadService.uploadFileToS3Bucket(
                        pathToSaveResource,
                        mimetype,
                        buffer,
                    )
                if (!uploadedData) {
                    throw new FileUploadFailException()
                    //return null
                }
                const { /*ETag,*/ /*Location ,*/ Key /*Bucket*/ } = uploadedData
                return { Key, mimetype }
            }),
        )

        const resourceDtos = resource_urls.map((resource) => {
            return {
                path: resource.Key,
                feed_id: createdFeed.id,
                type: FeedType.IMAGE,
                created_by: userId,
                mimetype: resource.mimetype,
            } as AddFeedResourceDto
        })

        const addedResources = await this.feedResourcesService.addFeedResource(
            resourceDtos,
        )
        if (!addedResources) return DatabaseUpdateFailException

        createdFeed.resource_ids = addedResources
        await createdFeed.save()

        user.$inc('number_of_feed', 1)
        user.save()

        return await this.feedsService.getFeedById(createdFeed.id, userId)
    }

    @Post('/by-type/video')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create video feed' })
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'video', maxCount: 1 },
            { name: 'thumbnail', maxCount: 1 },
        ]),
    )
    @ApiOkResponse({
        description: 'OK',
        type: FeedDetailDto,
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                video: {
                    type: 'string',
                    format: 'binary',
                },
                thumbnail: {
                    type: 'string',
                    format: 'binary',
                },
                content: {
                    type: 'string',
                },
                allowed_comment: {
                    type: 'boolean',
                },
            },
        },
    })
    async uploadFeedVideoType(
        @Req() req,
        @Body() dto: CreateFeedVideoDto,
        @UploadedFiles(new FeedVideoValidationPipe())
        files: { video: Express.Multer.File; thumbnail: Express.Multer.File },
    ) {
        const { userId } = req.user
        const user = await this.userService.findById(userId)
        if (!user) throw new UserNotFoundException()

        dto.hashtags = this.utilsService.splitHashtagFromString(dto.content)
        dto.created_by = userId

        const createdFeed = await this.feedsService.createFeed(
            dto,
            FeedType.VIDEO,
        )
        if (!createdFeed) return DatabaseUpdateFailException

        const objectKeyPrefix = 'feed-videos/' + moment().format('yyyy-MM-DD')
        //Video
        const video = files.video[0]
        const videoExt = video.originalname.split('.').pop()
        const videoObjectKey = `${objectKeyPrefix}/${
            createdFeed.id
        }/video-${uuidv4()}.${videoExt}`

        //Thumbnail
        const thumbnail = files.thumbnail[0]
        const thumbnailExt = thumbnail.originalname.split('.').pop()
        const thumbnailObjectKey = `${objectKeyPrefix}/${
            createdFeed.id
        }/thumbnail-${uuidv4()}.${thumbnailExt}`

        const [uploadedVideo, uploadedThumbnail] = await Promise.all([
            this.aws3FileUploadService.uploadFileToS3Bucket(
                videoObjectKey,
                video.mimetype,
                video.buffer,
            ),
            this.aws3FileUploadService.uploadFileToS3Bucket(
                thumbnailObjectKey,
                thumbnail.mimetype,
                thumbnail.buffer,
            ),
        ])

        if (!uploadedVideo || !uploadedThumbnail)
            throw new FileUploadFailException()

        const videoResource = {
            path: uploadedVideo.Key,
            feed_id: createdFeed.id,
            type: FeedType.VIDEO,
            created_by: userId,
            mimetype: video.mimetype,
        } as AddFeedResourceDto

        const thumbnailResource = {
            path: uploadedThumbnail.Key,
            feed_id: createdFeed.id,
            type: FeedType.VIDEO,
            created_by: userId,
            mimetype: thumbnail.mimetype,
        } as AddFeedResourceDto

        const addedResources = await this.feedResourcesService.addFeedResource([
            videoResource,
            thumbnailResource,
        ])
        if (!addedResources) return DatabaseUpdateFailException

        createdFeed.resource_ids = addedResources

        await createdFeed.save()

        user.$inc('number_of_feed', 1)
        await user.save()

        return await this.feedsService.getFeedById(createdFeed.id, userId)
    }

    @Get('/newest')
    @UseGuards(AnonymousGuard)
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
        const nextCursor: string | undefined = query['next']
        const currentUserId = _.get(req.user, 'userId')
        return this.feedsService.getNewestFeeds(currentUserId, nextCursor)
    }

    @Get('/trending')
    @UseGuards(AnonymousGuard)
    @ApiQuery({
        name: 'next',
        type: 'string',
        required: false,
    })
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get trending feeds' })
    @ApiOkResponse({
        type: PaginateFeedResultsDto,
    })
    @ApiImplicitQuery({
        required: false,
        name: 'next',
        type: String,
    })
    async getTrendingFeeds(@Query() query, @Req() req) {
        const nextCursor: string | undefined = query['next']
        const currentUserId = _.get(req.user, 'userId')
        return this.feedsService.getNewestFeeds(currentUserId, nextCursor)
    }

    @Get('/by-song/:songId')
    @UseGuards(AnonymousGuard)
    @ApiQuery({
        name: 'next',
        type: 'string',
        required: false,
    })
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get feeds by song id' })
    @ApiOkResponse({
        type: PaginateFeedResultsDto,
    })
    @ApiImplicitQuery({
        required: false,
        name: 'next',
        type: String,
    })
    async getFeedsBySongId(@Query() query, @Req() req) {
        const nextCursor: string | undefined = query['next']
        const currentUserId = _.get(req.user, 'userId')
        const songId = req.params.songId

        return this.feedsService.getFeedsBySongId(
            songId,
            currentUserId,
            nextCursor,
        )
    }

    @Get('/:id')
    @UseGuards(AnonymousGuard)
    @ApiOperation({ summary: 'Get feed by id' })
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'OK',
        type: FeedDetailDto,
    })
    async getFeedById(@Req() req): Promise<any> {
        const feedId = _.get(req.params, 'id')
        const currentUserId = _.get(req.user, 'userId')
        return this.feedsService.getFeedById(feedId, currentUserId)
    }
}
