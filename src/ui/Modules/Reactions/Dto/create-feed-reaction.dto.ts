import { ApiProperty } from '@nestjs/swagger'
import { UserReactionType } from 'src/shared/Types/types'

export class CreateFeedReactionDto {
    @ApiProperty({
        enum: UserReactionType,
        example: UserReactionType.HEART,
    })
    type: string
}