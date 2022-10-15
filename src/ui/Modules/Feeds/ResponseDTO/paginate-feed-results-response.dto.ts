import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsString } from 'class-validator'
import { FeedDetailResponseDto } from 'src/ui/Modules/Feeds/ResponseDTO/feed-detail-response.dto'

export class PaginateFeedResultsResponseDto {
    constructor() {
        this.results = []
        this.previous = ''
        this.hasPrevious = false
        this.hasNext = true
        this.next = ''
    }
    @ApiProperty({
        type: [FeedDetailResponseDto],
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
    next?: string
    @ApiProperty()
    @IsBoolean()
    hasNext: boolean
}
