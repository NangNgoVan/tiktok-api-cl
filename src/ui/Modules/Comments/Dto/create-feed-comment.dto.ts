import { FeedCommentLevel } from 'src/shared/Types/types'

export class CreateFeedCommentDto {
    feed_id: string
    content: string
    created_by: string
    level: FeedCommentLevel
    reply_to?: string
}
