import { Controller, Get, Post, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/shared/Guards/jwt.auth.guard'

@Controller('ui/feeds')
@ApiTags('Feed APIs')
export class FeedsController {
    // @Post('/by-type/image')
    // @UseGuards( JwtAuthGuard )
    // async uploadFeedImage() {
    // }
    // @Get('/newest')
    // @UseGuards( JwtAuthGuard )
    // async getNewestFeeds() {
    // }
    // @Get('/:id')
    // @UseGuards( JwtAuthGuard )
    // async getFeedDetail() {
    // }
}
