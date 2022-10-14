import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    UnprocessableEntityException,
} from '@nestjs/common'
import { fromBuffer } from 'file-type'
import { ImageMimeTypes } from '../Types/types'

@Injectable()
export class FeedImageValidationPipe implements PipeTransform {
    async transform(value: any, metadata: ArgumentMetadata) {
        const maxImageSize = 5 * 1024 * 1024

        if (!value.resources) {
            throw new UnprocessableEntityException('Images is not exists!')
        }

        const images = value.resources

        for (const i in images) {
            const image = images[i]
            const buffer = image.buffer

            const { mime } = await fromBuffer(buffer)

            if (!ImageMimeTypes.includes(mime)) {
                throw new UnprocessableEntityException(
                    "All images must have image's type",
                )
            }

            if (image.size > maxImageSize) {
                throw new UnprocessableEntityException(
                    `Size of ${image.originalname} is greater than 5 MB`,
                )
            }
        }
    }
}
