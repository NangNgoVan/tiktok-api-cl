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

    async addHashTag(createdBy: string, tags: string[]) {
        await Promise.all(
            tags.map(async (tag) => {
                const hashTag = await this.hashTagModel.findOne({
                    tag: tag.trim(),
                })
                if (!hashTag) {
                    await this.hashTagModel.create({
                        tag: tag.trim(),
                        created_by: createdBy,
                    })
                } else {
                    hashTag.number_of_use = hashTag.number_of_use + 1
                    await hashTag.save()
                }
            }),
        )
    }
}
