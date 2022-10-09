import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    UnprocessableEntityException,
} from '@nestjs/common'

@Injectable()
export class FeedVideoValidationPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        const maxImageSize = 5 * 1024 * 1024
        const maxVideoSize = 25 * 1024 * 1024
        const imagesMimeTypes = [
            'image/png',
            'image/jpeg',
            'image/jpg',
            'image/gif',
        ]

        if (!value.video || !value.thumbnail)
            throw new UnprocessableEntityException(
                'Video or thumbnail is not exists!',
            )

        const video = value.video[0]
        const thumbnail = value.thumbnail[0]

        if (video.mimetype !== 'video/mp4')
            throw new UnprocessableEntityException('Video type must be mp4')
        if (video.size > maxVideoSize)
            throw new UnprocessableEntityException('Video size too large')
        if (!imagesMimeTypes.includes(thumbnail.mimetype))
            throw new UnprocessableEntityException(
                'Thumbnail type is not valid',
            )
        if (thumbnail.size > maxImageSize)
            throw new UnprocessableEntityException('Thumbnail type is too big')

        return value
    }
}
