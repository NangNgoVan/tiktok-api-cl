import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
    StickerPackage,
    StickerPackageDocument,
} from 'src/shared/Schemas/sticker-package.schema'
import { CreateStickerPackageResquestDto } from '../RequestDTO/create-sticker-package-resquest.dto'

@Injectable()
export class StickerPackagesRepository {
    constructor(
        @InjectModel(StickerPackage.name)
        private readonly stickerPackageModel: Model<StickerPackageDocument>,
    ) {}

    async findById(id: string): Promise<StickerPackageDocument> {
        return this.stickerPackageModel.findOne({
            _id: id,
            deleted_at: null,
        })
    }

    async getCount(): Promise<number> {
        return this.stickerPackageModel.count({
            deleted_at: null,
        })
    }

    async getPaginatedStickerPackages(page: number, perPage: number) {
        return this.stickerPackageModel
            .find({
                deleted_at: null,
            })
            .skip(page > 0 ? (page - 1) * perPage : 0)
            .limit(perPage)
    }

    async createNewStickerPackage(
        createdBy: string,
        dto: CreateStickerPackageResquestDto,
        thumbnailKey: string,
    ) {
        const stickerPackage = new this.stickerPackageModel(dto)

        stickerPackage.created_by = createdBy

        if (thumbnailKey) stickerPackage.thumbnail = thumbnailKey

        return stickerPackage.save()
    }

    async updateStickerPackage(
        id: string,
        dto: Partial<CreateStickerPackageResquestDto>,
        thumbnailKey?: string,
    ) {
        if (!thumbnailKey) {
            return this.stickerPackageModel.findByIdAndUpdate(id, dto)
        } else {
            return this.stickerPackageModel.findByIdAndUpdate(id, {
                ...dto,
                thumbnail: thumbnailKey,
            })
        }
    }

    async deleteStickerPackage(id: string) {
        return await this.stickerPackageModel.findByIdAndUpdate(id, {
            deleted_at: Date.now(),
        })
    }
}
