import { Controller, Get, Req, UseGuards } from '@nestjs/common'

import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/shared/Guards/jwt.auth.guard'
import { UsersService } from '../Service/users.service'
import { AWS3FileUploadService } from 'src/shared/Services/aws-upload.service'
import { UserFollowsService } from 'src/ui/Follows/Service/user-follows.service'
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator'
import { PaginateFeedResultsDto } from 'src/ui/Feeds/Dto/paginate-feed-results.dto'
import { FeedsService } from 'src/ui/Feeds/Service/feeds.service'

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
        summary: 'Get posted feeds by current user',
    })
    @ApiOkResponse({
        type: PaginateFeedResultsDto,
    })
    async getFeedsPostedByCurrentUser(
        @Req() req,
    ): Promise<PaginateFeedResultsDto> {
        const currentUserId = req.user.userId
        const nextCursor: string | undefined = req.query['next']

        return this.feedsService.getPostedFeeds(
            currentUserId,
            currentUserId,
            nextCursor,
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
        summary: 'Get posted feeds by user',
    })
    @ApiOkResponse({
        type: PaginateFeedResultsDto,
    })
    async getFeedsPostedByUser(@Req() req): Promise<PaginateFeedResultsDto> {
        const userId = req.params.userId
        const currentUserId = req.user.userId
        const nextCursor: string | undefined = req.query['next']

        return this.feedsService.getPostedFeeds(
            userId,
            currentUserId,
            nextCursor,
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
        const nextCursor: string | undefined = req.query['next']

        return this.feedsService.getBookmarkedFeeds(
            currentUserId,
            currentUserId,
            nextCursor,
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
        summary: 'Get feeds bookmarked by user',
    })
    @ApiOkResponse({
        type: PaginateFeedResultsDto,
    })
    async getBookmarkedFeedsByUser(
        @Req() req,
    ): Promise<PaginateFeedResultsDto> {
        const userId = req.params.userId
        const currentUserId = req.user.userId
        const nextCursor: string | undefined = req.query['next']

        return this.feedsService.getBookmarkedFeeds(
            userId,
            currentUserId,
            nextCursor,
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
        summary: 'Get reacted feeds by current user',
    })
    @ApiOkResponse({
        type: PaginateFeedResultsDto,
    })
    async getReactedFeedsByCurrentUser(
        @Req() req,
    ): Promise<PaginateFeedResultsDto> {
        const currentUserId = req.user.userId
        const nextCursor: string | undefined = req.query['next']

        return this.feedsService.getReactedFeeds(
            currentUserId,
            currentUserId,
            nextCursor,
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
        summary: 'Get reacted feeds by user',
    })
    @ApiOkResponse({
        type: PaginateFeedResultsDto,
    })
    async getReactedFeedsByUser(@Req() req): Promise<PaginateFeedResultsDto> {
        const userId = req.params.userId
        const currentUserId = req.user.userId
        const nextCursor: string | undefined = req.query['next']

        return this.feedsService.getReactedFeeds(
            userId,
            currentUserId,
            nextCursor,
        )
    }
}
