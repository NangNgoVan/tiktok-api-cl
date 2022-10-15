import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
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

    // FIXME: reconcile
    async addFeedHashTag(feedId: string, createdBy: string, tags: string[]) {
        const validTags: string[] = _.compact(_.uniq(tags))
        await Promise.all(
            _.map(validTags, async (tag) => {
                const feedHashTag = await this.feedHashTagModel.findOne({
                    feed_id: feedId,
                    tag,
                    created_by: createdBy,
                })

                if (!feedHashTag) {
                    await this.feedHashTagModel.create({
                        feed_id: feedId,
                        tag,
                        created_by: createdBy,
                    })
                }
            }),
        )
    }
}
