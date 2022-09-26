// Nest dependencies
import { v4 as uuidv4 } from 'uuid'
import {
    Injectable,
    BadRequestException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common'

import { JwtService } from '@nestjs/jwt'
import { configService } from 'src/shared/Services/config.service'
import {
    TokenDataResponse,
    NonceTokenDataResponse,
} from 'src/shared/Services/data-serializer.service'

import Web3 from 'web3'
import * as crypto from 'crypto'

import { VerifySignatureDto } from '../Dto/verify-signature.dto'
import { CredentialDto } from '../Dto/credential.dto'
import { HttpStatusResult } from '../Types/types'
import { UsersService } from 'src/ui/Users/Service/users.service'

import { dataSerializerService } from './data-serializer.service'
import { UserAuthenticationMethodsService } from 'src/ui/Users/Service/user-authentication-methods.service'
import { UserDocument } from '../Schemas/user.schema'
import { UserNotFoundException } from '../Exceptions/http.exceptions'

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private userService: UsersService,
        private userAuthenticationMethodsService: UserAuthenticationMethodsService,
    ) {}

    async createNonce(): Promise<NonceTokenDataResponse> {
        const nonceCreatedByCrypto = crypto.randomBytes(16).toString('base64')

        const dataResponse = {
            nonce: nonceCreatedByCrypto,
        }

        return dataResponse
    }

    async logInWithMetamask(
        dto: VerifySignatureDto,
    ): Promise<TokenDataResponse> {
        const { nonce, signature, address } = dto
        const web3 = new Web3()

        const verifiedAddress = web3.eth.accounts.recover(nonce, signature)

        if (!verifiedAddress) throw new UnauthorizedException()

        if (address !== verifiedAddress) throw new UnauthorizedException()

        const userAuthenticationMethod =
            await this.userAuthenticationMethodsService.findByAddress(
                verifiedAddress,
            )

        let user: UserDocument

        if (!userAuthenticationMethod) {
            const uuid = uuidv4()
            user = await this.userService.create({
                full_name: `user ${uuid}`,
                nick_name: `user-${uuid}`,
            })

            await this.userAuthenticationMethodsService.create({
                user_id: user.id,
                data: { address: verifiedAddress },
                authentication_method: 'metamask',
            })
        } else {
            user = await this.userService.findById(
                userAuthenticationMethod.user_id,
            )
        }

        if (!user) {
            throw new UserNotFoundException()
        }

        const serializeUser = await dataSerializerService.selectProperties(
            user,
            ['id'],
        )

        const accessToken = this.jwtService.sign(
            {
                userId: serializeUser['id'],
            },
            {
                secret: configService.getEnv('JWT_SECRET'),
                expiresIn: 60,
            },
        )

        const refreshToken = this.jwtService.sign(
            {
                userId: serializeUser['id'],
            },
            {
                secret: configService.getEnv('JWT_REFRESH_TOKEN_SECRET'),
                expiresIn: '7 days',
            },
        )

        const dataResponse = {
            token: accessToken,
            refreshToken: refreshToken,
        }

        return dataResponse
    }

    async logInWithCredential(dto: CredentialDto): Promise<TokenDataResponse> {
        const token = 'token'

        const accessToken = this.jwtService.sign(
            {
                data: 'data_to_generate_jwt_token',
            },
            {
                secret: configService.getEnv('JWT_SECRET'),
                expiresIn: 60,
            },
        )

        const refreshToken = this.jwtService.sign(
            {
                data: 'data_to_generate_refresh_token',
            },
            {
                secret: configService.getEnv('JWT_REFRESH_TOKEN_SECRET'),
                expiresIn: 3600,
            },
        )

        const dataResponse = {
            token: accessToken,
            refreshToken: refreshToken,
        }

        return dataResponse
    }

    async verifyJWTToken(token: any, secretKey: string): Promise<string> {
        try {
            const verifyToken = await this.jwtService.verify(token, {
                secret: secretKey,
            })
            return verifyToken
        } catch (error) {
            return null
        }
    }

    async createJWTToken(
        data: object,
        secretKey: string,
        expiresIn: any,
    ): Promise<TokenDataResponse> {
        const token = this.jwtService.sign(data, {
            secret: secretKey,
            expiresIn: expiresIn,
        })

        const dataResponse = {
            token: token,
        }

        return dataResponse
    }

    async logOut(refreshToken: string): Promise<HttpStatusResult> {
        return {
            statusCode: 200,
            message: 'Logged out success!',
        }
    }
}
