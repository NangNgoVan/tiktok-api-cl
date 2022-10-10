import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { User, UserDocument } from 'src/shared/Schemas/user.schema'
import { Model } from 'mongoose'

@Injectable()
export class UsersRepository {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {}

    async findByById(id: string): Promise<UserDocument> {
        return this.userModel.findById(id)
    }

    async create(doc: Partial<UserDocument>) {
        return this.userModel.create(doc)
    }
}
