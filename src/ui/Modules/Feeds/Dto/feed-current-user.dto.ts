import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsEnum } from 'class-validator'
import { UserReactionType } from 'src/shared/Types/types'

export class FeedCurrentUserDto {
    @ApiProperty({
        default: false,
    })
    @IsBoolean()
    is_reacted: boolean
    @ApiProperty({
        default: false,
    })
    @IsBoolean()
    is_bookmarked: boolean

    @ApiPropertyOptional()
    @IsEnum({
        enum: UserReactionType,
    })
    reaction_type?: UserReactionType
}
