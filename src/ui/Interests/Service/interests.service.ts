import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Interest, InterestDocument } from 'src/shared/Schemas/interest.schema'
import { HttpStatusResult } from 'src/shared/Types/types'
import { GetInterestsDto } from '../Dto/get-interests.dto'

@Injectable()
export class InterestsService {
    constructor(
        @InjectModel(Interest.name)
        private interestModel: Model<InterestDocument>,
    ) {}

    async getAllInterests(): Promise<Interest[]> {
        return await this.interestModel.find({})
    }

    async createInterest(name: string, display_order: number) {
        const interestDto = {
            name: name,
            display_order: display_order,
        }
        const interest = new this.interestModel(interestDto)

        return interest.save()
    }
}
