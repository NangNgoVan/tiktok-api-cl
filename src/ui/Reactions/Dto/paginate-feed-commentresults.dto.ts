import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsString } from 'class-validator'
import { FeedReaction } from 'src/shared/Schemas/feed-reaction.schema'

export class PaginateFeedCommentResultsDto {
    @ApiProperty({
        type: [FeedReaction],
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
