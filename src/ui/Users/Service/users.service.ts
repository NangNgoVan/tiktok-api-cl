import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { User, UserDocument, UserSchema } from 'src/shared/Schemas/user.schema'
import { Model } from 'mongoose'
import { CreateUserDto } from '../Dto/create-user.dto'
import { UpdateUserDto } from '../Dto/update-user.dto'
import { UserNotFoundException } from 'src/shared/Exceptions/http.exceptions'

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        const createdUser = new this.userModel(createUserDto)

        return createdUser.save()
    }

    async findByAddress(address: string): Promise<User> {
        const foundedUser = this.userModel.findOne({ address: address })
        return foundedUser
    }

    async findById(id: string): Promise<User> {
        const foundedUser = this.userModel.findById(id)
        return foundedUser
    }

    async updateUser(id: string, dto: UpdateUserDto) {
        const user = await this.userModel.findById(id)
        if (!user) return UserNotFoundException

        user.email = dto.email
        user.address = dto.address
        user.birth_day = dto.birth_day
        user.full_name = dto.full_name
        user.nick_name = dto.nick_name
        user.should_show_account_setup_flow = dto.should_show_account_setup_flow
        //user.roles = dto.roles
        user.interests = dto.interests

        return user.save()
    }

    async updateAvatar(id: string, avatarUrl: string) {
        const user = await this.userModel.findById(id)
        if (!user) return UserNotFoundException

        user.avatar_url = avatarUrl

        await user.save()

        return user.avatar_url
    }
}
