import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import moment from 'moment'
import { SongsRepository } from '../Repositories/songs.repository'
import { CreateSongDto } from '../RequestDTO/create-song.dto'
import { GetSongResponseDto } from '../ResponseDTO/get-song.dto'
import _ from 'lodash'
import { UpdateSongDto } from '../RequestDTO/update-song.dto'
import { fromBuffer } from 'file-type'
import { UtilsService } from 'src/shared/Services/utils.service'
import { S3Service } from 'src/shared/Services/s3.service'
import { v4 as uuidv4 } from 'uuid'
import { SongDocument } from 'src/shared/Schemas/song.schema'
import { PaginateDataByPageResponseDto } from 'src/shared/ResponseDTO/paginate-data-by-page.dto'

@Injectable()
export class SongsService {
    constructor(
        private readonly songsRepository: SongsRepository,
        private readonly utilsService: UtilsService,
        private readonly s3Service: S3Service,
    ) {}

    private convertToDtoFromModel(model: SongDocument): GetSongResponseDto {
        return {
            id: model.id,
            name: model.name,
            thumbnail: model.thumbnail,
            number_of_bookmark: model.number_of_bookmark,
            duration_in_second: model.duration_in_second,
            artist: model.artist,
            path: model.path,
            deleted_at: model.deleted_at,
            created_by: model.created_by,
            display_order: model.display_order,
            number_of_use: model.number_of_use,
        }
    }

    async findById(id: string): Promise<GetSongResponseDto> {
        const songDocument = await this.songsRepository.findById(id)

        if (!songDocument) {
            throw new NotFoundException(`Song ${id} not found`)
        }

        return this.convertToDtoFromModel(songDocument)
    }

    async getAllSongs(
        page = 1,
        perPage = 2,
    ): Promise<PaginateDataByPageResponseDto<GetSongResponseDto>> {
        console.log(page, perPage)
        const data = (await this.songsRepository.getPage(page, perPage)).map(
            (song) => this.convertToDtoFromModel(song),
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
        dto: CreateSongDto,
    ): Promise<GetSongResponseDto> {
        const createdSong = await this.songsRepository.create(createdBy, dto)

        if (!createdSong) return null
        return this.convertToDtoFromModel(createdSong)
    }

    async updateSong(
        id: string,
        dto: UpdateSongDto,
    ): Promise<GetSongResponseDto> {
        const songDocument = await this.songsRepository.findById(id)

        const fields = _.omitBy(
            dto,
            (value) => _.isUndefined(value) || value === '',
        )

        await songDocument.updateOne(fields)

        return this.convertToDtoFromModel(songDocument)
    }

    async softDeleteSong(id: string) {
        const songDocument = await this.songsRepository.findById(id)

        await songDocument.update({
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
