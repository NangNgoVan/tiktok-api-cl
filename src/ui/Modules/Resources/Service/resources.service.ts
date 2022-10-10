import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
    FeedResource,
    FeedResourceDocument,
} from 'src/shared/Schemas/feed-resource.schema'
import { configService } from 'src/shared/Services/config.service'
import { AddFeedResourceDto } from '../Dto/add-feed-resource.dto'
import { GetFeedResourceDto } from '../Dto/get-feed-resource.dto'
import _ from 'lodash'
import { S3Service } from '../../../../shared/Services/s3.service'

@Injectable()
export class FeedResourcesService {
    constructor(
        @InjectModel(FeedResource.name)
        private feedResourcesModel: Model<FeedResourceDocument>,
        private s3Service: S3Service,
    ) {}

    async addFeedResource(dtos: AddFeedResourceDto[]) {
        const createdFeedResources = await this.feedResourcesModel.create(dtos)
        return createdFeedResources.map((resource) => resource.id)
    }

    async getResourceByIds(
        resourceIds: string[],
    ): Promise<GetFeedResourceDto[]> {
        const resources = await this.feedResourcesModel.find({
            _id: { $in: resourceIds },
        })

        return Promise.all(
            _.map(resources, async (resource) => {
                const path = await this.s3Service.getSignedUrl(
                    resource.path,
                    configService.getEnv('AWS_BUCKET_NAME'),
                    false,
                )

                return {
                    resource_id: resource.id,
                    path,
                    mimetype: resource.mimetype,
                }
            }),
        )
    }
}
