import {
    Body,
    Controller,
    Delete,
    Get,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/shared/Guards/jwt.auth.guard'
import { CreateFeedCommentDto } from '../Dto/create-feed-comment.dto'
import { FeedCommentService } from '../Service/feed-comments.service'

@Controller('ui/feeds')
@ApiTags('Comment APIs')
export class FeedCommentsController {
    constructor(private readonly feedCommentService: FeedCommentService) {}

    @Post('/:id/comments')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create comment by feed id (level 1)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                content: {
                    type: 'string',
                },
            },
        },
    })
    async createFeedComment(
        @Req() req,
        @Body() createCommentPayload: CreateFeedCommentDto,
    ): Promise<any> {
        const commentPayload = {
            feed_id: req.params.id,
            created_by: req.user.userId,
            content: createCommentPayload.content,
        } as CreateFeedCommentDto

        return this.feedCommentService.createFeedComment(commentPayload)
    }

    @Post('/:id/comments/:commentId/replies')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Reply comment (level 2)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                content: {
                    type: 'string',
                },
            },
        },
    })
    async createReplyComment(
        @Req() req,
        @Body() createCommentPayload: CreateFeedCommentDto,
    ): Promise<any> {
        const commentPayload = {
            feed_id: req.params.id,
            created_by: req.user.userId,
            content: createCommentPayload.content,
            reply_to: req.params.commentId,
        } as CreateFeedCommentDto

        return this.feedCommentService.createReplyComment(commentPayload)
    }

    @Delete('/:id/comments/:commentId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete comment' })
    async deleteComment(@Req() req): Promise<any> {
        const feedId = req.params.id
        const commentId = req.params.commentId
        const currentUserId = req.user.userId
        return this.feedCommentService.deleteComment(
            feedId,
            commentId,
            currentUserId,
        )
    }

    @Get('/:id/comments')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get comments by feed id (level 1)' })
    async getCommentByFeedId(@Req() req): Promise<any> {
        const feedId = req.params.id
        return this.feedCommentService.getCommentByFeedId(feedId)
    }

    @Get('/:id/comments/:commentId/replies')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get replies comments (level 2)' })
    async getCommentByFeedIdAndCommentId(@Req() req): Promise<any> {
        const feedId = req.params.id
        const commentId = req.params.commentId
        return this.feedCommentService.getCommentByFeedIdAndCommentId(
            feedId,
            commentId,
        )
    }
}
