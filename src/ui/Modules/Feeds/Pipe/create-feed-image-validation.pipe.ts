import {
    PipeTransform,
    Injectable,
    UnprocessableEntityException,
} from '@nestjs/common'
import { fromBuffer } from 'file-type'
import { ALLOWED_FEED_IMAGE_MIMETYPE } from '../../../../shared/Types/constants'
import _ from 'lodash'

@Injectable()
export class CreateFeedImageValidationPipe implements PipeTransform {
    async transform(value: any) {
        const MAX_IMAGE_SIZE = 5 * 1024 * 1024

        if (_.isEmpty(value.resources)) {
            throw new UnprocessableEntityException('resources is required')
        }

        const images = value.resources

        for (const i in images) {
            const image = images[i]
            const buffer = image.buffer

            const { mime } = await fromBuffer(buffer)

            if (image.size > MAX_IMAGE_SIZE) {
                throw new UnprocessableEntityException(
                    `Image ${image.originalname} size cannot exceed 5mb`,
                )
            }

            if (!ALLOWED_FEED_IMAGE_MIMETYPE.includes(mime)) {
                throw new UnprocessableEntityException(
                    `Image ${image.originalname} mimetype ${mime} is not supported`,
                )
            }
        }

        return value
    }
}
