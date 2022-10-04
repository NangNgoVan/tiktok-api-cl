import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { HashTag, HashTagDocument } from 'src/shared/Schemas/hashtag.schema'

@Injectable()
export class HashTagService {
    constructor(
        @InjectModel(HashTag.name)
        private readonly hashTagModel: Model<HashTagDocument>,
    ) {}

    async addHashTag(tags: string[]) {
        return this.hashTagModel.findOneAndUpdate(
            { tag: { $in: tags } },
            { $inc: { number_of_use: 1 } },
            {
                upsert: true,
            },
        )
    }
}
