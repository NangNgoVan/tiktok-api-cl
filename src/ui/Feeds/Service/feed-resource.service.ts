import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { FeedReactionDocument } from 'src/shared/Schemas/feed-reaction.schema'
import { FeedResource } from 'src/shared/Schemas/feed-resource.schema'
import { AddFeedResourceDto } from '../Dto/add-feed-resource.dto'

@Injectable()
export class FeedResourcesService {
    constructor(
        @InjectModel(FeedResource.name)
        private feedResourcesModel: Model<FeedReactionDocument>,
    ) {}

    async addFeedResource(dtos: AddFeedResourceDto[]) {
        const createdFeedResources = await this.feedResourcesModel.create(dtos)
        return createdFeedResources.map((resource) => resource.id)
    }
}
