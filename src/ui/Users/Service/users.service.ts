import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { User, UserDocument } from 'src/shared/Schemas/user.schema'
import { Model } from 'mongoose'
import { CreateUserDto } from '../Dto/create-user.dto'
import { UpdateUserDto } from '../Dto/update-user.dto'
import { UserNotFoundException } from 'src/shared/Exceptions/http.exceptions'
import _ from 'lodash'

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<UserDocument> {
        const createdUser = new this.userModel(createUserDto)

        return createdUser.save()
    }

    async findById(id: string): Promise<UserDocument> {
        const foundedUser = this.userModel.findById(id)
        return foundedUser
    }

    async updateUser(id: string, dto: UpdateUserDto) {
        const user = await this.userModel.findById(id)

        if (!user) throw new UserNotFoundException()

        const validUpdatedFields = _.omitBy(dto, _.isUndefined)

        return user.update(validUpdatedFields)
    }

    async updateAvatar(id: string, avatarUrl: string) {
        const user = await this.userModel.findById(id)
        if (!user) throw new UserNotFoundException()

        user.avatar_url = avatarUrl

        await user.save()

        return user.avatar_url
    }
}
