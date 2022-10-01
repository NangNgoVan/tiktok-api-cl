import { Controller, Delete, Post, Req, UseGuards } from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/shared/Guards/jwt.auth.guard'
import { FeedReaction } from 'src/shared/Schemas/feed-reaction.schema'
import { BookmarksService } from '../Service/book-marks.service'

@Controller('ui/feeds')
@ApiTags('Feed Bookmarks APIs')
export class BookmarksController {
    constructor(private readonly feedBookmarksService: BookmarksService) {}

    @Post('/:id/bookmarks')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'OK',
        type: FeedReaction,
    })
    @ApiOperation({ summary: 'create bookmarks for feed' })
    async create(@Req() req): Promise<any> {
        const feed_id = req.params.id
        const created_by = req.user.userId

        return this.feedBookmarksService.createBookmarkByFeedId(
            feed_id,
            created_by,
        )
    }

    @Delete('/:id/bookmarks')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'OK',
    })
    @ApiOperation({ summary: 'Delete bookmark by feed id' })
    async delete(@Req() req): Promise<any> {
        const feedId = req.params.id
        const currentUserId = req.user.userId

        return this.feedBookmarksService.deleteBookmark(feedId, currentUserId)
    }
}
