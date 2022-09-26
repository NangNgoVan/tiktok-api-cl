import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
    UserAuthenticationMethod,
    UserAuthenticationMethodDocument,
} from 'src/shared/Schemas/user-authentication-method.schema'
import { CreateUserAuthenticationMethodDto } from '../Dto/create-user-authentication-method.dto'
import { AuthenticationMethod } from '../../../shared/Types/types'

@Injectable()
export class UserAuthenticationMethodsService {
    constructor(
        @InjectModel(UserAuthenticationMethod.name)
        private userAuthenticationMethodModel: Model<UserAuthenticationMethodDocument>,
    ) {}

    async create(
        createUserAuthenticationMethodDto: CreateUserAuthenticationMethodDto,
    ): Promise<UserAuthenticationMethod> {
        const createdUserAuthenticationMethod =
            new this.userAuthenticationMethodModel(
                createUserAuthenticationMethodDto,
            )

        return createdUserAuthenticationMethod.save()
    }

    async findByAddress(
        address: string,
    ): Promise<UserAuthenticationMethodDocument> {
        const foundedUserAuthenticationMethod =
            this.userAuthenticationMethodModel.findOne({
                authentication_method: AuthenticationMethod.METAMASK,
                data: {
                    address,
                },
            })
        return foundedUserAuthenticationMethod
    }
}
