// Nest dependencies
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

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private userService: UsersService,
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

        //if (address !== verifiedAddress) throw new UnauthorizedException()

        // Find user by signature in DB
        let user = await this.userService.findByAddress(verifiedAddress)
        // If user not found, create new User
        if (!user)
            user = await this.userService.create({ address: verifiedAddress })

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

    async createJWTToken(expiresIn: any): Promise<TokenDataResponse> {
        const token = this.jwtService.sign(
            {
                data: 'data_to_generate_jwt_token',
            },
            {
                secret: configService.getEnv('JWT_REFRESH_TOKEN_SECRET'),
                expiresIn: expiresIn,
            },
        )

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
