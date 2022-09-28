import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/shared/Guards/jwt.auth.guard'
import { FeedReaction } from 'src/shared/Schemas/feed-reaction.schema'
import { CreateFeedReactionDto } from '../Dto/create-feed-reaction.dto'
import { FeedReactionsService } from '../Service/feed-reaction.service'

@Controller('ui/feeds')
@ApiTags('Feed Reaction APIs')
export class FeedReactionController {
    constructor(private readonly feedReactionsService: FeedReactionsService) {}
    @Post('/:id/reactions')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'OK',
        type: FeedReaction,
    })
    @ApiOperation({ summary: 'create feed reactions for feed' })
    async createFeedReaction(
        @Req() req,
        @Body() createReactionPayload: CreateFeedReactionDto,
    ): Promise<any> {
        const createReaction = {
            feed_id: req.params.id,
            type: createReactionPayload.type,
            created_by: req.user.userId,
        } as CreateFeedReactionDto

        return this.feedReactionsService.createReactionByFeedId(createReaction)
    }
}
