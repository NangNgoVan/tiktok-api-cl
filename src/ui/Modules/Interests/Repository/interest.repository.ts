import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Interest, InterestDocument } from 'src/shared/Schemas/interest.schema'
import { Cacheable } from '@type-cacheable/core'
import _ from 'lodash'

@Injectable()
export class InterestRepository {
    constructor(
        @InjectModel(Interest.name)
        private interestModel: Model<InterestDocument>,
    ) {}

    @Cacheable({
        cacheKey: 'ui:interests:all',
        noop: (args: any[]) => _.get(args, '0.disableCache', true),
        ttlSeconds: (args: any[]) =>
            _.get(args, '0.cacheForSeconds', 10 * 60 * 60),
    })
    async getAll(
        // eslint-disable-next-line
        cacheOptions?: {
            disableCache?: boolean
            cacheForSeconds?: number
        },
    ) {
        return this.interestModel.find()
    }
}
