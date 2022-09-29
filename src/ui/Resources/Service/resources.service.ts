import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { FeedReactionDocument } from 'src/shared/Schemas/feed-reaction.schema'
import {
    FeedResource,
    FeedResourceDocument,
} from 'src/shared/Schemas/feed-resource.schema'
import { configService } from 'src/shared/Services/config.service'
import { AddFeedResourceDto } from '../Dto/add-feed-resource.dto'
import { GetFeedResourceDto } from '../Dto/get-feed-resource.dto'

@Injectable()
export class FeedResourcesService {
    constructor(
        @InjectModel(FeedResource.name)
        private feedResourcesModel: Model<FeedResourceDocument>,
    ) {}

    async addFeedResource(dtos: AddFeedResourceDto[]) {
        const createdFeedResources = await this.feedResourcesModel.create(dtos)
        return createdFeedResources.map((resource) => resource.id)
    }

    async getResourceByIds(
        resourceIds: string[],
    ): Promise<GetFeedResourceDto[]> {
        try {
            return await Promise.all(
                resourceIds.map(async (id) => {
                    const resource = await this.feedResourcesModel.findById(id)
                    return {
                        resource_id: resource.id,
                        path:
                            configService.getEnv('AWS_IMAGE_BASE_URL') +
                            '/' +
                            resource.path,
                    } as GetFeedResourceDto
                }),
            )
        } catch {
            return null
        }
    }
}
