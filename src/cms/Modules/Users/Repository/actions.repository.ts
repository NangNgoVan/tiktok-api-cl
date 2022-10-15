import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
    Action,
    ActionDocument,
} from '../../../../shared/Schemas/action.schema'

@Injectable()
export class ActionsRepository {
    constructor(
        @InjectModel(Action.name) private actionModel: Model<ActionDocument>,
    ) {}

    async getAll() {
        return this.actionModel.find()
    }

    async deleteByName(name: string) {
        return this.actionModel.findOneAndDelete({
            name,
        })
    }

    async create(name: string) {
        return this.actionModel.create({
            name,
        })
    }
}
