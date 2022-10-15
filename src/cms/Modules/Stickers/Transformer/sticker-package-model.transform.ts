import { Injectable } from '@nestjs/common'
import {
    StickerPackage,
    StickerPackageDocument,
} from 'src/shared/Schemas/sticker-package.schema'
import { configService } from 'src/shared/Services/config.service'
import { S3Service } from 'src/shared/Services/s3.service'
import { GetStickerPackageResponseDto } from '../ResponseDTO/get-sticker-package-response.dto'

@Injectable()
export class StickerPackageModelTransform {
    constructor(private readonly s3Service: S3Service) {}

    async convertToStickerPackageResponseDtoFromModel(
        model: StickerPackageDocument,
    ): Promise<GetStickerPackageResponseDto> {
        const thumbnailSignedUrl = await this.s3Service.getSignedUrl(
            model.thumbnail,
            configService.getEnv('AWS_BUCKET_NAME'),
            false,
        )
        return {
            _id: model['_id'].toString(),
            name: model.name,
            display_order: model.display_order,
            created_by: model.created_by,
            thumbnail: thumbnailSignedUrl,
            description: model.description,
        }
    }
}
