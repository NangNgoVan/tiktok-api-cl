import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
    FeedResource,
    FeedResourceDocument,
} from 'src/shared/Schemas/feed-resource.schema'
import { configService } from 'src/shared/Services/config.service'
import _ from 'lodash'
import { S3Service } from '../../../../shared/Services/s3.service'

@Injectable()
export class FeedResourceService {
    constructor(
        @InjectModel(FeedResource.name)
        private feedResourceModel: Model<FeedResourceDocument>,
        private s3Service: S3Service,
    ) {}

    async getFeedResourcesByFeedId(feedId: string): Promise<
        {
            resource_id: string
            path: string
            mimetype: string
        }[]
    > {
        const feedResources: FeedResourceDocument[] =
            await this.feedResourceModel.find({
                feed_id: feedId,
            })

        return Promise.all(
            _.map(feedResources, async (feedResource) => {
                const path = await this.s3Service.getSignedUrl(
                    feedResource.path,
                    configService.getEnv('AWS_BUCKET_NAME'),
                    false,
                )

                return {
                    resource_id: feedResource.id,
                    path,
                    mimetype: feedResource.mimetype,
                }
            }),
        )
    }
}
