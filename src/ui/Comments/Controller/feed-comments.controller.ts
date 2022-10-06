import {
    Body,
    Controller,
    Delete,
    Get,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiBody,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger'
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator'
import { AnonymousGuard } from 'src/shared/Guards/anonymous.guard'
import { JwtAuthGuard } from 'src/shared/Guards/jwt.auth.guard'
import { FeedComment } from 'src/shared/Schemas/feed-comment.schema'
import { CreateFeedCommentDto } from '../Dto/create-feed-comment.dto'
import { PaginateFeedCommentResultsDto } from '../Dto/paginate-feed-commentresults.dto'
import { FeedCommentService } from '../Service/feed-comments.service'

@Controller('ui/feeds')
@ApiTags('Feed Comment APIs')
export class FeedCommentsController {
    constructor(private readonly feedCommentService: FeedCommentService) {}
    @Post('/:id/comments')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'OK',
        type: FeedComment,
    })
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
    @ApiOkResponse({
        description: 'OK',
        type: FeedComment,
    })
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
    @ApiOkResponse({
        description: 'OK',
    })
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
    @UseGuards(AnonymousGuard)
    @ApiBearerAuth()
    @ApiImplicitQuery({
        required: false,
        name: 'next',
        type: String,
    })
    @ApiOkResponse({
        description: 'OK',
        type: PaginateFeedCommentResultsDto,
    })
    @ApiOperation({ summary: 'Get comments by feed id (level 1)' })
    async getCommentByFeedId(@Req() req): Promise<any> {
        let next = undefined
        if (req.query) next = req.query['next']
        const feedId = req.params.id
        const currentUserId = req.user.userId
        return this.feedCommentService.getCommentByFeedId(
            feedId,
            currentUserId,
            next,
        )
    }

    @Get('/:id/comments/:commentId/replies')
    @UseGuards(AnonymousGuard)
    @ApiBearerAuth()
    @ApiImplicitQuery({
        required: false,
        name: 'next',
        type: String,
    })
    @ApiOkResponse({
        description: 'OK',
        type: PaginateFeedCommentResultsDto,
    })
    @ApiOperation({ summary: 'Get replies comments (level 2)' })
    async getCommentByFeedIdAndCommentId(@Req() req): Promise<any> {
        let next = undefined
        if (req.query) next = req.query['next']

        const feedId = req.params.id
        const commentId = req.params.commentId
        const currentUserId = req.user.userId
        return this.feedCommentService.getCommentByFeedIdAndCommentId(
            feedId,
            commentId,
            currentUserId,
            next,
        )
    }
}
