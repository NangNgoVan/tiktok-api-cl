import {
    PipeTransform,
    Injectable,
    UnprocessableEntityException,
} from '@nestjs/common'
import {
    ALLOWED_FEED_IMAGE_MIMETYPE,
    ALLOWED_FEED_VIDEO_MIMETYPE,
} from '../Types/constants'
import { fromBuffer } from 'file-type'
import _ from 'lodash'

@Injectable()
export class FeedVideoValidationPipe implements PipeTransform {
    async transform(value: any) {
        const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024
        const MAX_VIDEO_SIZE = 25 * 1024 * 1024

        if (_.isEmpty(value.video)) {
            throw new UnprocessableEntityException('video is required')
        }

        if (_.isEmpty(value.thumbnail)) {
            throw new UnprocessableEntityException('thumbnail is required')
        }

        const video: Express.Multer.File = value.video[0]
        const thumbnail: Express.Multer.File = value.thumbnail[0]

        if (thumbnail.size > MAX_THUMBNAIL_SIZE) {
            throw new UnprocessableEntityException(
                'thumbnail size cannot exceed 5mb',
            )
        }

        if (video.size > MAX_VIDEO_SIZE) {
            throw new UnprocessableEntityException(
                'video size cannot exceed 25mb',
            )
        }

        const thumbnailBuffer = thumbnail.buffer
        const videoBuffer = video.buffer

        const [{ mime: thumbnailMimeType }, { mime: videoMimeType }] =
            await Promise.all([
                fromBuffer(thumbnailBuffer),
                fromBuffer(videoBuffer),
            ])

        if (!ALLOWED_FEED_IMAGE_MIMETYPE.includes(thumbnailMimeType)) {
            throw new UnprocessableEntityException(
                `thumbnail mimetype ${thumbnailMimeType} is not supported`,
            )
        }

        if (!ALLOWED_FEED_VIDEO_MIMETYPE.includes(videoMimeType)) {
            throw new UnprocessableEntityException(
                `video mimetype ${videoMimeType} is not supported`,
            )
        }

        return value
    }
}
