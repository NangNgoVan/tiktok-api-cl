import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { fromBuffer } from 'file-type'
import moment from 'moment'
import { Model } from 'mongoose'
import {
    StickerPackage,
    StickerPackageDocument,
} from 'src/shared/Schemas/sticker-package.schema'
import { S3Service } from 'src/shared/Services/s3.service'
import { StickerPackagesRepository } from '../Repository/sticker-packages.repository'
import { CreateStickerPackageResquestDto } from '../RequestDTO/create-sticker-package-resquest.dto'
import { v4 as uuidv4 } from 'uuid'
import { GetStickerPackageResponseDto } from '../ResponseDTO/get-sticker-package-response.dto'
import { StickerPackageModelTransform } from '../Transformer/sticker-package-model.transform'

@Injectable()
export class StickerPackagesService {
    constructor(
        private readonly stickersPackageRepository: StickerPackagesRepository,
        private readonly s3Service: S3Service,
        private readonly stickerPackageModelTransform: StickerPackageModelTransform,
    ) {}

    async findById(id: string): Promise<GetStickerPackageResponseDto> {
        return this.stickerPackageModelTransform.convertToStickerPackageResponseDtoFromModel(
            await this.stickersPackageRepository.findById(id),
        )
    }

    async getPaginatedStickerPackages(page = 1, perPage = 10) {
        const data = await Promise.all(
            (
                await this.stickersPackageRepository.getPaginatedStickerPackages(
                    page,
                    perPage,
                )
            ).map((e) =>
                this.stickerPackageModelTransform.convertToStickerPackageResponseDtoFromModel(
                    e,
                ),
            ),
        )
        const total = Math.ceil(
            (await this.stickersPackageRepository.getCount()) / perPage,
        )

        return {
            data: data,
            total: total,
        }
    }

    async getStickerPackageById(
        id: string,
    ): Promise<GetStickerPackageResponseDto> {
        return await this.stickerPackageModelTransform.convertToStickerPackageResponseDtoFromModel(
            await this.stickersPackageRepository.findById(id),
        )
    }

    async createNewStickerPackage(
        createdBy: string,
        thumbnailKey: string,
        dto: CreateStickerPackageResquestDto,
    ) {
        return this.stickersPackageRepository.createNewStickerPackage(
            createdBy,
            dto,
            thumbnailKey,
        )
    }

    async updateStickerPackage(
        id: string,
        dto: Partial<CreateStickerPackageResquestDto>,
        thumbnailKey: string,
    ) {
        return this.stickersPackageRepository.updateStickerPackage(
            id,
            dto,
            thumbnailKey,
        )
    }

    async deleteStickerPackage(id: string) {
        return this.stickersPackageRepository.deleteStickerPackage(id)
    }

    async uploadThumbnail(file: Express.Multer.File) {
        const buffer = file.buffer

        const { ext, mime } = await fromBuffer(buffer)
        const key = `sticker-packages/${moment().format(
            'YYYY-MM-DD',
        )}/${uuidv4()}.${ext}`

        const { Key } = await this.s3Service.uploadFileToS3Bucket(
            key,
            mime,
            buffer,
        )

        return Key
    }

    async deleteThumbnail(key: string) {
        // will be added after merge song api branch
    }
}
