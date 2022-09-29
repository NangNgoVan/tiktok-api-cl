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

        return await this.feedsService.getFeedsPostedByUser(userId, next)
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
        let next = undefined
        if (req.query) next = req.query['next']

        return await this.feedsService.getFeedsPostedByUser(userId, next)
    }
}
