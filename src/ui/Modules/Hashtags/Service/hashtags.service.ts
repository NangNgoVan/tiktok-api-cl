import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { HashTag, HashTagDocument } from 'src/shared/Schemas/hashtag.schema'
import _ from 'lodash'

@Injectable()
export class HashTagService {
    constructor(
        @InjectModel(HashTag.name)
        private readonly hashTagModel: Model<HashTagDocument>,
    ) {}

    async addHashTag(tags: string[]) {
        const validTags = _.compact(_.uniq(tags))

        await Promise.all(
            _.map(validTags, async (tag) => {
                await this.hashTagModel.findOneAndUpdate(
                    {
                        tag,
                    },
                    {
                        $inc: {
                            number_of_use: 1,
                        },
                    },
                    {
                        upsert: true,
                    },
                )
            }),
        )
    }
}
