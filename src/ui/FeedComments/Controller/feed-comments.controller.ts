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
import { FeedCommentLevel } from 'src/shared/Types/types'
import { CreateFeedCommentDto } from '../Dto/create-feed-comment.dto'
import { FeedCommentsService } from '../Service/feed-comments.service'

@Controller('ui/feeds')
@ApiTags('Comment APIs')
export class FeedCommentsController {
    constructor(private readonly CommentService: FeedCommentsService) {}

    @Post('/:id/comments')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'create new comment' })
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

        return this.CommentService.createFeedComment(commentPayload)
    }

    @Post('/:id/comments/:commentId/replies')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'create new reply comment' })
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

        return this.CommentService.createReplyComment(commentPayload)
    }

    @Delete('/:id/comments/:commentId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'delete comment' })
    async deleteComment(@Req() req): Promise<any> {
        const feedId = req.params.id
        const commentId = req.params.commentId
        return this.CommentService.deleteComment(feedId, commentId)
    }

    @Get('/:id/comments')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'get comment by feed id' })
    async getCommentByFeedId(@Req() req): Promise<any> {
        const feedId = req.params.id
        return this.CommentService.getCommentByFeedId(feedId)
    }

    @Get('/:id/comments/:commentId/replies')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'get comment by feed id and comment id' })
    async getCommentByFeedIdAndCommentId(@Req() req): Promise<any> {
        const feedId = req.params.id
        const commentId = req.params.commentId
        return this.CommentService.getCommentByFeedIdAndCommentId(
            feedId,
            commentId,
        )
    }
}
