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

    async getAllActions() {
        return this.actionModel.find()
    }
}
