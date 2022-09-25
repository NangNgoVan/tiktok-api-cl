import { ApiProperty } from '@nestjs/swagger'
import { String } from 'aws-sdk/clients/acm'
import { IsArray, IsBoolean, IsString } from 'class-validator'
import { Feed } from 'src/shared/Schemas/feed.schema'
import { FeedDetailDto } from 'src/ui/Feeds/Dto/feed-detail.dto'

export class PaginateFeedResultsDto {
    @ApiProperty({
        type: [FeedDetailDto],
    })
    results
    @ApiProperty()
    @IsString()
    previous: string
    @ApiProperty()
    @IsBoolean()
    hasPrevious: boolean
    @ApiProperty()
    @IsString()
    next: string
    @ApiProperty()
    @IsBoolean()
    hasNext: boolean
}
