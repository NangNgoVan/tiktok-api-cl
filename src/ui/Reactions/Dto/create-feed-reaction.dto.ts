import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'
import { UserReactionType } from 'src/shared/Types/types'

export class CreateFeedReactionDto {
    feed_id: string

    @ApiProperty({
        enum: UserReactionType,
        isArray: true,
        example: [
            UserReactionType.HEART,
            UserReactionType.LAUGH,
            UserReactionType.LIKE,
        ],
    })
    type: UserReactionType
}
