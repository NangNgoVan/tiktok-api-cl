import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Interest, InterestDocument } from 'src/shared/Schemas/interest.schema'

@Injectable()
export class InterestsService {
    constructor(
        @InjectModel(Interest.name)
        private interestModel: Model<InterestDocument>,
    ) {}

    async getAllInterests(): Promise<Interest[]> {
        return await this.interestModel.find({})
    }
}
