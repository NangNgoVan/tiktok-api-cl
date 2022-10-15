import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import moment from 'moment'
import { SongsRepository } from '../Repositories/songs.repository'
import { CreateSongRequestDto } from '../RequestDTO/create-song-request.dto'
import { GetSongResponseDto } from '../ResponseDTO/get-song-request.dto'
import _ from 'lodash'
import { UpdateSongRequestDto } from '../RequestDTO/update-song-request.dto'
import { fromBuffer } from 'file-type'
import { UtilsService } from 'src/shared/Services/utils.service'
import { S3Service } from 'src/shared/Services/s3.service'
import { v4 as uuidv4 } from 'uuid'
import { PaginateDataByPageResponseDto } from 'src/shared/ResponseDTO/paginate-data-by-page.dto'
import { SongModelTransformService } from '../Transformer/song-model.transform'
import { configService } from 'src/shared/Services/config.service'

@Injectable()
export class SongsService {
    constructor(
        private readonly songsRepository: SongsRepository,
        private readonly utilsService: UtilsService,
        private readonly s3Service: S3Service,
        private readonly songModelTransformService: SongModelTransformService,
    ) {}

    async findById(id: string): Promise<GetSongResponseDto> {
        const songDocument = await this.songsRepository.findById(id)

        if (!songDocument) {
            throw new NotFoundException(`Song ${id} not found`)
        }

        return await this.songModelTransformService.transformSongModelToGetSongResponseDto(
            songDocument,
        )
    }

    async getPaginatedSongs(
        page = 1,
        perPage = 2,
    ): Promise<PaginateDataByPageResponseDto<GetSongResponseDto>> {
        const paginatedSong = await this.songsRepository.getPaginatedSongs(
            page,
            perPage,
        )
        const data = await Promise.all(
            paginatedSong.map(
                async (song) =>
                    await this.songModelTransformService.transformSongModelToGetSongResponseDto(
                        song,
                    ),
            ),
        )
        const total = Math.ceil(
            (await this.songsRepository.getCount()) / perPage,
        )
        return {
            data: data,
            total: total,
        }
    }

    async createSong(
        createdBy: string,
        dto: CreateSongRequestDto,
    ): Promise<GetSongResponseDto> {
        const createdSong = await this.songsRepository.create(createdBy, dto)

        if (!createdSong) return null
        return await this.songModelTransformService.transformSongModelToGetSongResponseDto(
            createdSong,
        )
    }

    async updateSong(
        id: string,
        dto: UpdateSongRequestDto,
    ): Promise<GetSongResponseDto> {
        const songDocument = await this.songsRepository.findById(id)

        const fields = _.omitBy(
            dto,
            (value) => _.isUndefined(value) || value === '',
        )

        await songDocument.updateOne(fields)

        this.s3Service.deleteFileFromS3Bucket(
            configService.getEnv('AWS_BUCKET_NAME'),
            songDocument.thumbnail,
        )

        this.s3Service.deleteFileFromS3Bucket(
            configService.getEnv('AWS_BUCKET_NAME'),
            songDocument.path,
        )

        return await this.songModelTransformService.transformSongModelToGetSongResponseDto(
            songDocument,
        )
    }

    async softDeleteSong(id: string) {
        const songDocument = await this.songsRepository.findById(id)

        await songDocument.updateOne({
            deleted_at: Date.now(),
        })
    }

    async uploadAudioData(audio: Express.Multer.File) {
        const audioBuffer = audio.buffer
        const audioType = await fromBuffer(audioBuffer)
        const audioKeyPrefix = `songs/${moment().format(
            'YYYY-MM-DD',
        )}/audio-${uuidv4()}.${audioType.ext}`

        if (!this.utilsService.checkAudioMimeTypeIsValid(audioType.mime)) {
            throw new BadRequestException(
                `mime type ${audioType.mime} is not supported`,
            )
        }

        return this.s3Service.uploadFileToS3Bucket(
            audioKeyPrefix,
            audioType.mime,
            audioBuffer,
        )
    }

    async uploadThumbnailData(thumbnail: Express.Multer.File) {
        const thumbnailBuffer = thumbnail.buffer
        const thumbnailType = await fromBuffer(thumbnailBuffer)
        const thumbnailKeyPrefix = `songs/${moment().format(
            'YYYY-MM-DD',
        )}/thumbnail-${uuidv4()}.${thumbnailType.ext}`

        if (!this.utilsService.checkImageMimeTypeIsValid(thumbnailType.mime)) {
            throw new BadRequestException(
                `mime type ${thumbnailType.mime} is not supported`,
            )
        }

        return this.s3Service.uploadFileToS3Bucket(
            thumbnailKeyPrefix,
            thumbnailType.mime,
            thumbnailBuffer,
        )
    }
}
