import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
    UserAuthenticationMethod,
    UserAuthenticationMethodDocument,
} from 'src/shared/Schemas/user-authentication-method.schema'
import { AuthenticationMethod } from '../../../shared/Types/types'

@Injectable()
export class UserAuthenticationMethodsRepository {
    constructor(
        @InjectModel(UserAuthenticationMethod.name)
        private userAuthenticationMethodModel: Model<UserAuthenticationMethodDocument>,
    ) {}

    async findByUsername(
        username: string,
    ): Promise<UserAuthenticationMethodDocument> {
        return this.userAuthenticationMethodModel.findOne({
            authentication_method: AuthenticationMethod.CREDENTIAL,
            'data.username': username,
        })
    }
}
