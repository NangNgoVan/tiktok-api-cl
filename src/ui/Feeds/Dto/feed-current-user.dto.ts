import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsEnum } from 'class-validator'
import { UserReactionType } from 'src/shared/Types/types'

export class FeedCurrentUserDto {
    @ApiProperty()
    @IsBoolean()
    is_reacted: boolean
    @ApiProperty()
    @IsBoolean()
    is_bookmarked: boolean
    @ApiProperty()
    @IsEnum({
        enum: UserReactionType,
    })
    reaction_type: UserReactionType
}
