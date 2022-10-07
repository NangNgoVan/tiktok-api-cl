import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
    UserAuthenticationMethod,
    UserAuthenticationMethodDocument,
} from 'src/shared/Schemas/user-authentication-method.schema'
import { AuthenticationMethod } from '../../../shared/Types/types'
import { CreateUserAuthenticationMethodDto } from '../RequestDTO/create-user-authentication-method.dto'

@Injectable()
export class UserAuthenticationMethodsService {
    constructor(
        @InjectModel(UserAuthenticationMethod.name)
        private userAuthenticationMethodModel: Model<UserAuthenticationMethodDocument>,
    ) {}

    async createAuthenticationMethod(
        createUserAuthenticationMethodDto: CreateUserAuthenticationMethodDto,
    ) {
        return this.userAuthenticationMethodModel.create(
            createUserAuthenticationMethodDto,
        )
    }

    async findByAddress(
        address: string,
    ): Promise<UserAuthenticationMethodDocument> {
        return this.userAuthenticationMethodModel.findOne({
            authentication_method: AuthenticationMethod.METAMASK,
            'data.address': address,
        })
    }

    async findByUsername(
        username: string,
    ): Promise<UserAuthenticationMethodDocument> {
        return this.userAuthenticationMethodModel.findOne({
            authentication_method: AuthenticationMethod.CREDENTIAL,
            'data.username': username,
        })
    }

    async findByUserIdAndAuthenticationMethod(
        userId: string,
        authenticationMethod: AuthenticationMethod,
    ): Promise<UserAuthenticationMethodDocument> {
        return this.userAuthenticationMethodModel.findOne({
            user_id: userId,
            authentication_method: authenticationMethod,
        })
    }

    async deleteByUserIdAndAuthenticationMethod(
        userId: string,
        authenticationMethod: AuthenticationMethod,
    ): Promise<void> {
        await this.userAuthenticationMethodModel.deleteOne({
            authentication_method: authenticationMethod,
            user_id: userId,
        })
    }

    async getAllAuthenticationMethodsByUserId(userId: string) {
        return this.userAuthenticationMethodModel.find({
            user_id: userId,
        })
    }
}
