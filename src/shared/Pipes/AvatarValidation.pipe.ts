import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common'

@Injectable()
export class AvatarValidationPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        // Check maxsize of avatar
    }
}
