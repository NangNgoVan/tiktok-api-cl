import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsString } from 'class-validator'
import { FeedComment } from 'src/shared/Schemas/feed-comment.schema'

export class PaginateFeedCommentResultsDto {
    @ApiProperty({
        type: [FeedComment],
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
