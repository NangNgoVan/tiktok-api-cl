import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common'

@Injectable()
export class FeedMetadataValidationPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        // Check maxsize of avatar
    }
}
