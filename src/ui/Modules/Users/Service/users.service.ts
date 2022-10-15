import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { User, UserDocument } from 'src/shared/Schemas/user.schema'
import { Model } from 'mongoose'
import { CreateUserDto } from '../RequestDTO/create-user.dto'
import { UpdateUserRequestDto } from '../RequestDTO/update-user-request.dto'
import { UserNotFoundException } from 'src/shared/Exceptions/http.exceptions'
import _ from 'lodash'
import { UserFollowsService } from 'src/ui/Modules/Follows/Service/user-follows.service'
import { configService } from 'src/shared/Services/config.service'
import { S3Service } from 'src/shared/Services/s3.service'
import { fromBuffer } from 'file-type'
import { v4 as uuidv4 } from 'uuid'
import moment from 'moment'

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private readonly userFollowsService: UserFollowsService,
        private readonly s3Service: S3Service,
    ) {}

    async create(createUserDto: CreateUserDto) {
        const createdUser = new this.userModel(createUserDto)

        return createdUser.save()
    }

    async getById(id: string): Promise<UserDocument> {
        return this.userModel.findById(id)
    }

    async update(id: string, updateUserRequestDto: UpdateUserRequestDto) {
        const user = await this.userModel.findById(id)

        if (!user) throw new UserNotFoundException()

        const validUpdatedFields = _.omitBy(
            updateUserRequestDto,
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

        await user.update(validUpdatedFields)
    }

    async updateAvatar(id: string, avatar: Express.Multer.File) {
        const user = await this.userModel.findById(id)
        if (!user) throw new UserNotFoundException()

        const { buffer, size } = avatar

        const { ext, mime: mimetype } = await fromBuffer(buffer)

        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(mimetype)) {
            throw new BadRequestException(
                `mime type ${mimetype} is not supported`,
            )
        }

        this.s3Service.deleteFileFromS3Bucket(
            configService.getEnv('AWS_BUCKET_NAME'),
            user.avatar,
        )

        const avatarObjectKey = `avatars/${moment().format(
            'yyyy-MM-DD',
        )}/${id}/${uuidv4()}.${ext}`

        const { Key } = await this.s3Service.uploadFileToS3Bucket(
            avatarObjectKey,
            mimetype,
            buffer,
        )

        const url = await this.s3Service.getSignedUrl(
            Key,
            configService.getEnv('AWS_BUCKET_NAME'),
            false,
        )

        user.avatar = Key
        await user.save()

        return {
            url: url,
            size: size,
        }
    }
}
