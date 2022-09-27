import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
    UserAuthenticationMethod,
    UserAuthenticationMethodDocument,
} from 'src/shared/Schemas/user-authentication-method.schema'
import { AuthenticationMethod } from '../../../shared/Types/types'
import { CreateUserAuthenticationMethodDto } from '../Dto/create-user-authentication-method.dto'

@Injectable()
export class UserAuthenticationMethodsService {
    constructor(
        @InjectModel(UserAuthenticationMethod.name)
        private userAuthenticationMethodModel: Model<UserAuthenticationMethodDocument>,
    ) {}

    async createAuthenticationMethod(
        createUserAuthenticationMethodDto: CreateUserAuthenticationMethodDto,
    ): Promise<UserAuthenticationMethod> {
        return this.userAuthenticationMethodModel.create({
            createUserAuthenticationMethodDto,
        })
    }

    async findByAddress(
        address: string,
    ): Promise<UserAuthenticationMethodDocument> {
        return this.userAuthenticationMethodModel.findOne({
            authentication_method: AuthenticationMethod.METAMASK,
            data: {
                address,
            },
        })
    }

    async findByUsername(
        username: string,
    ): Promise<UserAuthenticationMethodDocument> {
        return this.userAuthenticationMethodModel.findOne({
            authentication_method: AuthenticationMethod.CREDENTIAL,
            data: {
                username,
            },
        })
    }
}
