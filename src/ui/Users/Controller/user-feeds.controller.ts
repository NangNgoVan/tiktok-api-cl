import { Controller, Get, Req, UseGuards } from '@nestjs/common'

import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/shared/Guards/jwt.auth.guard'
import { UsersService } from '../Service/users.service'
import { AWS3FileUploadService } from 'src/shared/Services/aws-upload.service'
import { UserFollowsService } from 'src/ui/Follows/Service/user-follows.service'
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator'
import { PaginateFeedResultsDto } from 'src/ui/Feeds/Dto/paginate-feed-results.dto'
import { FeedsService } from 'src/ui/Feeds/Service/feeds.service'
import { FeedFilterType } from 'src/shared/Types/types'

@Controller('ui/users')
@ApiTags('User Feed APIs')
export class UserFeedsController {
    constructor(
        private readonly userService: UsersService,
        private readonly aws3FileUploadService: AWS3FileUploadService,
        private readonly userFollowsService: UserFollowsService,
        private readonly feedsService: FeedsService,
    ) {}

    @Get('/current/feeds')
    @ApiImplicitQuery({
        name: 'next',
        type: 'string',
        required: false,
    })
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Get feeds posted by current user',
    })
    @ApiOkResponse({
        type: PaginateFeedResultsDto,
    })
    async getFeedsPostedByCurrentUser(
        @Req() req,
    ): Promise<PaginateFeedResultsDto> {
        const { userId } = req.user
        let next = undefined
        if (req.query) next = req.query['next']

        return await this.feedsService.getFeedsByUser(
            userId,
            userId,
            FeedFilterType.POSTED_BY,
            next,
        )
    }

    @Get('/:userId/feeds')
    @ApiImplicitQuery({
        name: 'next',
        type: 'string',
        required: false,
    })
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Get feeds posted by user id',
    })
    @ApiOkResponse({
        type: PaginateFeedResultsDto,
    })
    async getFeedsPostedByUser(@Req() req): Promise<PaginateFeedResultsDto> {
        const userId = req.params.userId
        const currentUserId = req.user.userId
        let next = undefined
        if (req.query) next = req.query['next']

        return await this.feedsService.getFeedsByUser(
            currentUserId,
            userId,
            FeedFilterType.POSTED_BY,
            next,
        )
    }
    @Get('/current/feed-bookmarks')
    @ApiImplicitQuery({
        name: 'next',
        type: 'string',
        required: false,
    })
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Get feeds bookmarked by current user',
    })
    @ApiOkResponse({
        type: PaginateFeedResultsDto,
    })
    async getFeedBookmarksByCurrentUser(
        @Req() req,
    ): Promise<PaginateFeedResultsDto> {
        const currentUserId = req.user.userId
        let next = undefined
        if (req.query) next = req.query['next']

        return await this.feedsService.getFeedsByUser(
            currentUserId,
            currentUserId,
            FeedFilterType.BOOKMARKED,
            next,
        )
    }

    @Get('/:userId/feed-bookmarks')
    @ApiImplicitQuery({
        name: 'next',
        type: 'string',
        required: false,
    })
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Get feeds bookmarked by user id',
    })
    @ApiOkResponse({
        type: PaginateFeedResultsDto,
    })
    async getFeedBookmarksByUser(@Req() req): Promise<PaginateFeedResultsDto> {
        const userId = req.params.userId
        const currentUserId = req.user.userId
        let next = undefined
        if (req.query) next = req.query['next']

        return await this.feedsService.getFeedsByUser(
            currentUserId,
            userId,
            FeedFilterType.BOOKMARKED,
            next,
        )
    }

    @Get('/current/feed-reactions')
    @ApiImplicitQuery({
        name: 'next',
        type: 'string',
        required: false,
    })
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Get feeds reacted by current user',
    })
    @ApiOkResponse({
        type: PaginateFeedResultsDto,
    })
    async getFeedsReactedByCurrentUser(
        @Req() req,
    ): Promise<PaginateFeedResultsDto> {
        const currentUserId = req.user.userId
        let next = undefined
        if (req.query) next = req.query['next']

        return await this.feedsService.getFeedsByUser(
            currentUserId,
            currentUserId,
            FeedFilterType.REACTED,
            next,
        )
    }

    @Get('/:userId/feed-reactions')
    @ApiImplicitQuery({
        name: 'next',
        type: 'string',
        required: false,
    })
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Get feeds reacted by user',
    })
    @ApiOkResponse({
        type: PaginateFeedResultsDto,
    })
    async getFeedsReactedByUser(@Req() req): Promise<PaginateFeedResultsDto> {
        const userId = req.params.userId
        const currentUserId = req.user.userId
        let next = undefined
        if (req.query) next = req.query['next']

        return await this.feedsService.getFeedsByUser(
            currentUserId,
            userId,
            FeedFilterType.REACTED,
            next,
        )
    }
}
