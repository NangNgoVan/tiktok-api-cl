import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { PaginateDataByPageResponseDto } from 'src/shared/ResponseDTO/paginate-data-by-page.dto'
import { Song, SongDocument } from 'src/shared/Schemas/song.schema'
import { CreateSongDto } from '../RequestDTO/create-song.dto'
import { GetSongResponseDto } from '../ResponseDTO/get-song.dto'

export class SongsRepository {
    constructor(
        @InjectModel(Song.name)
        private songModel: Model<SongDocument>,
    ) {}

    async findById(id: string) {
        return this.songModel.findById(id)
    }

    async getAll(page: number, perPage: number) {
        return this.songModel.find({})
    }

    async getPage(pageNumber: number, perPage: number) {
        return this.songModel
            .find({})
            .skip(pageNumber > 0 ? (pageNumber - 1) * perPage : 0)
            .limit(perPage)
    }

    async getCount() {
        return this.songModel.countDocuments()
    }

    async create(createdBy: string, dto: CreateSongDto): Promise<SongDocument> {
        const newSong = new this.songModel(dto)
        newSong.created_by = createdBy
        return await newSong.save()
    }
}
