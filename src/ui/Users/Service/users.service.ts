import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { User, UserDocument } from 'src/shared/Schemas/user.schema'
import { Model } from 'mongoose'
import { CreateUserDto } from '../Dto/create-user.dto'
import { UpdateUserDto } from '../Dto/update-user.dto'
import { UserNotFoundException } from 'src/shared/Exceptions/http.exceptions'
import _ from 'lodash'
import { UserFollowsService } from 'src/ui/Follows/Service/user-follows.service'

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private readonly userFollowsService: UserFollowsService,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<UserDocument> {
        const createdUser = new this.userModel(createUserDto)

        return createdUser.save()
    }

    async findById(id: string): Promise<UserDocument> {
        try {
            const foundedUser = await this.userModel.findById(id)
            return foundedUser
        } catch {
            return null
        }
    }

    async updateUser(id: string, dto: UpdateUserDto) {
        const user = await this.userModel.findById(id)

        if (!user) throw new UserNotFoundException()

        const validUpdatedFields = _.omitBy(
            dto,
            (value) => _.isUndefined(value) || value === '',
        )

        if (validUpdatedFields.email) {
            if (
                await this.userModel.exists({
                    email: validUpdatedFields.email,
                })
            ) {
                throw new BadRequestException(
                    `Email ${validUpdatedFields.email} already exists`,
                )
            }
        }

        if (validUpdatedFields.nick_name) {
            if (
                await this.userModel.exists({
                    nick_name: validUpdatedFields.nick_name,
                })
            ) {
                throw new BadRequestException(
                    `Nickname ${validUpdatedFields.nick_name} already exists`,
                )
            }
        }

        return user.update(validUpdatedFields)
    }

    async updateAvatar(id: string, avatar: string) {
        const user = await this.userModel.findById(id)
        if (!user) throw new UserNotFoundException()

        // FIXME: should delete old avatar before save new avatar
        user.avatar = avatar

        await user.save()

        return user.avatar
    }
}
