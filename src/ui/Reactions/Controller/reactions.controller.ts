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
import { JwtAuthGuard } from 'src/shared/Guards/jwt.auth.guard'
import { FeedReaction } from 'src/shared/Schemas/feed-reaction.schema'
import { UserReactionType } from 'src/shared/Types/types'
import { CreateFeedReactionDto } from '../Dto/create-feed-reaction.dto'
import { FeedReactionsService } from '../Service/feed-reaction.service'

@Controller('ui/feeds')
@ApiTags('Comment APIs')
export class FeedReactionController {
    constructor(private readonly FeedReactionsService: FeedReactionsService) {}
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

        return this.FeedReactionsService.createReactionByFeedId(createReaction)
    }
}
