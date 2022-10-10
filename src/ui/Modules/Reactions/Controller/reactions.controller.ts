import { Body, Controller, Delete, Post, Req, UseGuards } from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/shared/Guards/jwt.auth.guard'
import { FeedReaction } from 'src/shared/Schemas/feed-reaction.schema'
import { CreateFeedReactionDto } from '../Dto/create-feed-reaction.dto'
import { ReactionsService } from '../Service/reaction.service'

@Controller('ui/feeds')
@ApiTags('Feed Reaction APIs')
export class FeedReactionController {
    constructor(private readonly reactionsService: ReactionsService) {}

    @Post('/:id/reactions')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'OK',
        type: FeedReaction,
    })
    @ApiOperation({ summary: 'create reactions for feed' })
    async createFeedReaction(
        @Req() req,
        @Body() createFeedReactionDto: CreateFeedReactionDto,
    ): Promise<any> {
        const feed_id = req.params.id
        const currentUserId = req.user.userId

        return this.reactionsService.createFeedReaction(
            feed_id,
            currentUserId,
            createFeedReactionDto,
        )
    }

    @Post('/:id/comments/:commentId/reactions')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'OK',
        type: FeedReaction,
    })
    @ApiOperation({ summary: 'create reactions for feed comment' })
    async createFeedCommentReaction(
        @Req() req,
        @Body() CreateFeedReactionDto: CreateFeedReactionDto,
    ): Promise<any> {
        const feed_id = req.params.id
        const commentId = req.params.commentId
        const created_by = req.user.userId

        return this.reactionsService.createCommentReaction(
            feed_id,
            commentId,
            created_by,
            CreateFeedReactionDto,
        )
    }

    @Delete('/:id/reactions')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'OK',
    })
    @ApiOperation({ summary: 'Delete by feed id' })
    async unReactionOfFeed(@Req() req): Promise<any> {
        const feedId = req.params.id
        const currentUserId = req.user.userId
        return this.reactionsService.deleteFeedReaction(feedId, currentUserId)
    }

    @Delete('/:id/comments/:commentId/reactions')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'OK',
    })
    @ApiOperation({ summary: 'Delete by feed id' })
    async unReactionOfFeedComment(@Req() req): Promise<any> {
        const feedId = req.params.id
        const commentId = req.params.commentId
        const currentUserId = req.user.userId

        return this.reactionsService.deleteFeedCommentReaction(
            feedId,
            commentId,
            currentUserId,
        )
    }
}
