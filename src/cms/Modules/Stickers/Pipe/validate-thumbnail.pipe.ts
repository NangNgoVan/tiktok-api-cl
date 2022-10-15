import {
    ArgumentMetadata,
    Injectable,
    PipeTransform,
    UnprocessableEntityException,
} from '@nestjs/common'
import { fromBuffer } from 'file-type'
import _ from 'lodash'
import { ALLOWED_FEED_IMAGE_MIMETYPE } from 'src/shared/Types/constants'

@Injectable()
export class ThumbnailValidationPipe implements PipeTransform {
    async transform(value: any, metadata: ArgumentMetadata) {
        if (_.isEmpty(value.thumbnail)) {
            throw new UnprocessableEntityException('Thumbnail invalid')
        }

        const thumbnail = value.thumbnail[0]

        const { mime } = await fromBuffer(thumbnail.buffer)

        if (!ALLOWED_FEED_IMAGE_MIMETYPE.includes(mime)) {
            throw new UnprocessableEntityException('Thumbnail type invalid')
        }

        return value
    }
}
