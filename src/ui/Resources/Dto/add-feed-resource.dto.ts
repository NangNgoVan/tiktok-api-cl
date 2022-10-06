import { IsString } from 'class-validator'
import { FeedType } from 'src/shared/Types/types'

export class AddFeedResourceDto {
    path: string
    feed_id: string
    type: FeedType
    created_by: string
    mimetype: string
}
