import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { UserReactionType } from 'src/shared/Types/types'

export class FeedCurrentUserResponseDto {
    @ApiProperty({
        default: false,
        type: Boolean,
    })
    is_reacted: boolean

    @ApiProperty({
        default: false,
        type: Boolean,
    })
    is_bookmarked: boolean

    @ApiPropertyOptional({
        enum: UserReactionType,
    })
    reaction_type?: UserReactionType
}
