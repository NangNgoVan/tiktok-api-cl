import { SongDocument } from 'src/shared/Schemas/song.schema'
import { GetSongResponseDto } from '../ResponseDTO/get-song-request.dto'

import _ from 'lodash'
import { configService } from 'src/shared/Services/config.service'
import { S3Service } from 'src/shared/Services/s3.service'

export class SongModelTransformService {
    constructor(private s3Service: S3Service) {}

    public async transformSongModelToGetSongResponseDto(
        model: SongDocument,
    ): Promise<GetSongResponseDto> {
        const [signedThumbnail, signedPath] = await Promise.all([
            model.thumbnail
                ? await this.s3Service.getSignedUrl(
                      model.thumbnail,
                      configService.getEnv('AWS_BUCKET_NAME'),
                      false,
                  )
                : null,
            model.path
                ? await this.s3Service.getSignedUrl(
                      model.path,
                      configService.getEnv('AWS_BUCKET_NAME'),
                      false,
                  )
                : null,
        ])

        return {
            id: model.id,
            name: model.name,
            thumbnail: signedThumbnail,
            number_of_bookmark: model.number_of_bookmark,
            duration_in_second: model.duration_in_second,
            artist: model.artist,
            path: signedPath,
            deleted_at: model.deleted_at,
            created_by: model.created_by,
            display_order: model.display_order,
            number_of_use: model.number_of_use,
        }
    }
}
