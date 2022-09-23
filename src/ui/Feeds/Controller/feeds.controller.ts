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
    FileInterceptor,
    FilesInterceptor,
} from '@nestjs/platform-express'
import {
    ApiBearerAuth,
    ApiBody,
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
import { FeedType } from 'src/shared/Types/types'
import { UsersService } from 'src/ui/Users/Service/users.service'
import { Logger } from 'winston'
import { AddFeedResourceDto } from '../Dto/add-feed-resource.dto'
import { CreateFeedDto } from '../Dto/create-feed.dto'
import { FeedResourcesService } from '../Service/feed-resource.service'
import { FeedsService } from '../Service/feeds.service'

@Controller('ui/feeds')
@ApiTags('Feed APIs')
export class FeedsController {
    constructor(
        private readonly feedsService: FeedsService,
        private readonly feedResourcesService: FeedResourcesService,
        private readonly userService: UsersService,
    ) {}

    @Post('/by-type/image')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create new image feed by current user' })
    @UseInterceptors(FilesInterceptor('resources'))
    @ApiOkResponse({
        description: 'OK',
        type: Feed,
    })
    // @ApiBody({
    //     schema: {
    //         type: 'object',
    //         properties: {
    //             file: {
    //                 type: 'string',
    //                 format: 'binary',
    //             },
    //         },
    //     },
    // })
    async uploadFeedImageType(
        @Req() req,
        @Body() dto: CreateFeedDto,
        @UploadedFiles() files: { resources?: Express.Multer.File[] },
    ) {
        const { userId } = req.user
        const user = await this.userService.findById(userId)
        if (!user) throw new UserNotFoundException()

        const path = 'feeds/' + moment().format('yyyy-MM-DD')

        console.log(files)
        //upload resource to w3
        //return [resource_urls]

        //Test
        const resource_urls = ['url_test_1', 'url_test_2']

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
        type: Feed,
    })
    async getFeedDetail(@Req() req): Promise<any> {
        const feedId = req.params.id
        console.log(feedId)
        const feed = await this.feedsService.getFeedDetail(feedId)
        if (!feed) throw new NotFoundException()
        return feed
    }
}
