import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import e from 'express'
import { Model } from 'mongoose'
import _ from 'lodash'
import {
    FeedHashTag,
    FeedHashTagDocument,
} from 'src/shared/Schemas/feed-hashtag.schema'

@Injectable()
export class FeedHashTagsService {
    constructor(
        @InjectModel(FeedHashTag.name)
        private readonly feedHashTagModel: Model<FeedHashTagDocument>,
    ) {}

    async addFeedHashTag(feedId: string, createdBy: string, tags: string[]) {
        tags = _.uniq(tags)
        await Promise.all(
            tags.map(async (tag) => {
                const feedHashTag = await this.feedHashTagModel.findOne({
                    feed_id: feedId,
                    tag: tag.trim(),
                    created_by: createdBy,
                })

                if (!feedHashTag) {
                    await this.feedHashTagModel.create({
                        feed_id: feedId,
                        tag: tag.trim(),
                        created_by: createdBy,
                    })
                }
            }),
        )
    }
}
