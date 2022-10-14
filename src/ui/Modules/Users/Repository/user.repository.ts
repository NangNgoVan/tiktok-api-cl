import { Injectable } from '@nestjs/common'
import { MongoPaging } from 'mongo-cursor-pagination'
import { InjectModel } from '@nestjs/mongoose'
import { User, UserDocument } from '../../../../shared/Schemas/user.schema'

@Injectable()
export class UserRepository {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: MongoPaging<UserDocument>,
    ) {}

    async getById(id: string): Promise<UserDocument | undefined> {
        return this.userModel.findById(id)
    }
}
