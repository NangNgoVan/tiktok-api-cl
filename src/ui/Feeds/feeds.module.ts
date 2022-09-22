import { Module } from '@nestjs/common'
import { FeedsController } from './Controller/feeds.controller'
import { FeedsService } from './Service/feeds.service'

@Module({
    controllers: [FeedsController],
    providers: [FeedsService],
})
export class FeedsModule {}
