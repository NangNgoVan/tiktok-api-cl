import { Injectable } from '@nestjs/common'
import { MongoPaging } from 'mongo-cursor-pagination'
import { InjectModel } from '@nestjs/mongoose'
import {
    FeedResource,
    FeedResourceDocument,
} from '../../../../shared/Schemas/feed-resource.schema'
import _ from 'lodash'

@Injectable()
export class FeedResourceRepository {
    constructor(
        @InjectModel(FeedResource.name)
        private readonly feedResource: MongoPaging<FeedResourceDocument>,
    ) {}

    async create(feedResourceObjectOrArray: FeedResource | FeedResource[]) {
        const feedResources = _.isArray(feedResourceObjectOrArray)
            ? feedResourceObjectOrArray
            : [feedResourceObjectOrArray]

        return this.feedResource.create(feedResources)
    }
}
