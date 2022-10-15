import {
    Body,
    Controller,
    Get,
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
import { JwtAuthGuard } from 'src/shared/Guards/jwt-auth.guard'
import { UserData } from 'src/shared/Types/types'
import { CreateFeedImageRequestDto } from '../RequestDTO/create-feed-image-request.dto'
import { FeedService } from '../Service/feed.service'
import { FeedDetailResponseDto } from '../ResponseDTO/feed-detail-response.dto'
import { PaginateFeedResultsResponseDto } from '../ResponseDTO/paginate-feed-results-response.dto'
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator'
import _ from 'lodash'
import { CreateFeedVideoValidationPipe } from 'src/ui/Modules/Feeds/Pipe/create-feed-video-validation.pipe'
import { CreateFeedVideoRequestDto } from '../RequestDTO/create-feed-video-request.dto'
import { AnonymousGuard } from 'src/shared/Guards/anonymous.guard'
import { CreateFeedImageValidationPipe } from 'src/ui/Modules/Feeds/Pipe/create-feed-image-validation.pipe'
import { CurrentUser } from '../../../../shared/Decorators/current-user.decorator'
import { FeedCreatorService } from '../Service/feed-creator.service'

@Controller('ui/feeds')
@ApiTags('Feed APIs')
export class FeedController {
    constructor(
        private readonly feedsService: FeedService,
        private readonly feedCreatorService: FeedCreatorService,
    ) {}

    @Post('/by-type/image')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create feed image' })
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'resources', maxCount: 10 }]),
    )
    @ApiOkResponse({
        description: 'OK',
        type: FeedDetailResponseDto,
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
                content: {
                    type: 'string',
                },
                primary_image_index: {
                    type: 'number',
                },
                allowed_comment: {
                    type: 'boolean',
                },
                hashtags: {
                    type: 'array',
                    items: {
                        type: 'string',
                        maxLength: 50,
                    },
                    maxItems: 15,
                },
            },
            required: ['resources', 'primary_image_index', 'allowed_comment'],
        },
    })
    async createFeedImages(
        @Body() dto: CreateFeedImageRequestDto,
        @UploadedFiles(new CreateFeedImageValidationPipe())
        files: { resources: Express.Multer.File[] },
        @CurrentUser() currentUser: UserData,
    ) {
        return this.feedCreatorService.createFeedImages(
            files.resources,
            dto,
            currentUser.userId,
        )
    }

    @Post('/by-type/video')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create feed video' })
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'video', maxCount: 1 },
            { name: 'thumbnail', maxCount: 1 },
        ]),
    )
    @ApiOkResponse({
        description: 'OK',
        type: FeedDetailResponseDto,
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
                    default: true,
                },
                hashtags: {
                    type: 'array',
                    items: {
                        type: 'string',
                        maxLength: 50,
                    },
                    maxItems: 15,
                },
            },
        },
    })
    async createFeedVideo(
        @Body() dto: CreateFeedVideoRequestDto,
        @UploadedFiles(new CreateFeedVideoValidationPipe())
        files: {
            video: Express.Multer.File[]
            thumbnail: Express.Multer.File[]
        },
        @CurrentUser() currentUser: UserData,
    ) {
        return this.feedCreatorService.createFeedVideos(
            files.thumbnail[0], // FIXME: why array
            files.video[0], // FIXME: why array
            dto,
            currentUser.userId,
        )
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
        type: PaginateFeedResultsResponseDto,
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
        type: PaginateFeedResultsResponseDto,
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
        type: PaginateFeedResultsResponseDto,
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
        type: FeedDetailResponseDto,
    })
    async getFeedById(@Req() req): Promise<any> {
        const feedId = _.get(req.params, 'id')
        const currentUserId = _.get(req.user, 'userId')
        return this.feedsService.getFeedById(feedId, currentUserId)
    }
}
