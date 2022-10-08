import { Controller, Get, Req, UseGuards } from '@nestjs/common'

import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/shared/Guards/jwt.auth.guard'
import { UsersService } from '../Service/users.service'
import { S3Service } from 'src/shared/Services/s3.service'
import { UserFollowsService } from 'src/ui/Follows/Service/user-follows.service'
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator'
import { PaginateFeedResultsDto } from 'src/ui/Feeds/Dto/paginate-feed-results.dto'
import { FeedsService } from 'src/ui/Feeds/Service/feeds.service'

@Controller('ui/users')
@ApiTags('User Feed APIs')
export class UserFeedsController {
    constructor(
        private readonly userService: UsersService,
        private readonly aws3FileUploadService: S3Service,
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
        const createdBy = req.user.userId
        const currentUserId = req.user.userId
        const nextCursor: string | undefined = req.query['next']

        return this.feedsService.getPostedFeeds(
            createdBy,
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
        const createdBy = req.params.userId
        const currentUserId = req.user.userId
        const nextCursor: string | undefined = req.query['next']

        return this.feedsService.getPostedFeeds(
            createdBy,
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
        const bookmarkedBy = req.user.userId
        const currentUserId = req.user.userId
        const nextCursor: string | undefined = req.query['next']

        return this.feedsService.getBookmarkedFeeds(
            bookmarkedBy,
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
        const bookmarkedBy = req.params.userId
        const currentUserId = req.user.userId
        const nextCursor: string | undefined = req.query['next']

        return this.feedsService.getBookmarkedFeeds(
            bookmarkedBy,
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
        const reactedBy = req.user.userId
        const currentUserId = req.user.userId
        const nextCursor: string | undefined = req.query['next']

        return this.feedsService.getReactedFeeds(
            reactedBy,
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
        const reactedBy = req.params.userId
        const currentUserId = req.user.userId
        const nextCursor: string | undefined = req.query['next']

        return this.feedsService.getReactedFeeds(
            reactedBy,
            currentUserId,
            nextCursor,
        )
    }

    @Get('/current/feed-followings')
    @ApiImplicitQuery({
        name: 'next',
        type: 'string',
        required: false,
    })
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: "Get following's feeds by `current` alias",
    })
    @ApiOkResponse({
        type: PaginateFeedResultsDto,
    })
    async getFollowingFeedsByCurrentUser(
        @Req() req,
    ): Promise<PaginateFeedResultsDto> {
        const userId = req.user.userId
        const currentUserId = req.user.userId
        const nextCursor: string | undefined = req.query['next']

        return this.feedsService.getFollowingFeeds(
            userId,
            currentUserId,
            nextCursor,
        )
    }
}
