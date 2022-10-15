import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import { Song, SongDocument, SongSchema } from 'src/shared/Schemas/song.schema'
import { CreateSongRequestDto } from '../RequestDTO/create-song-request.dto'

export class SongsRepository {
    constructor(
        @InjectModel(Song.name)
        private songModel: Model<SongDocument>,
    ) {}

    async findById(id: string) {
        return this.songModel.findOne({
            _id: id,
            deleted_at: null,
        })
    }

    async getAll(page: number, perPage: number) {
        return this.songModel.find({
            deleted_at: null,
        })
    }

    async getPaginatedSongs(pageNumber: number, perPage: number) {
        // const paginateSongModel = mongoose
        //     .model<SongDocument,
        //         mongoose.PaginateModel<SongDocument>
        //     >('Songs', SongSchema, 'Songs')
        // await paginateSongModel.paginate({}, {
        //     page: pageNumber,
        //     limit: perPage
        // }, (err, result) => {
        //     console.log(result)
        // })

        return this.songModel
            .find({})
            .skip(pageNumber > 0 ? (pageNumber - 1) * perPage : 0)
            .limit(perPage)
    }

    async getCount() {
        return this.songModel.countDocuments()
    }

    async create(
        createdBy: string,
        dto: CreateSongRequestDto,
    ): Promise<SongDocument> {
        const newSong = new this.songModel(dto)
        newSong.created_by = createdBy
        return await newSong.save()
    }
}
