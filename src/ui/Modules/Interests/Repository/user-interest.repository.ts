import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
    UserInterest,
    UserInterestDocument,
} from '../../../../shared/Schemas/user-interest.schema'
import _ from 'lodash'

@Injectable()
export class UserInterestRepository {
    constructor(
        @InjectModel(UserInterest.name)
        private userInterestModel: Model<UserInterestDocument>,
    ) { }

    async create(userId: string, interestIds: string[]) {
        const docs = _.map(interestIds, (interestId: string) => {
            return {
                user_id: userId,
                interest_id: interestId,
            }
        })

        return this.userInterestModel.create(docs)
    }

    async getByUserId(userId: string): Promise<UserInterestDocument[]> {
        return this.userInterestModel.find({
            user_id: userId,
        })
    }

    async delete(userId: string) {
        await this.userInterestModel.deleteMany({
            user_id: userId,
        })
    }
}
