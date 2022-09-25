import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'
import { CommentLevelType } from 'src/shared/Types/types'

export class CreateCommentDto {
    feed_id: string
    content: string
    created_by: string
    level: CommentLevelType
    reply_to?: string
}
