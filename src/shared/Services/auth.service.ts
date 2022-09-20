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

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) {}

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
        const { nonce, signature } = dto
        const web3 = new Web3()
        const token = web3.eth.accounts.recover(nonce, signature)

        if (!token) throw new UnauthorizedException()

        const accessToken = this.jwtService.sign(
            {
                signature,
            },
            {
                secret: configService.getEnv('JWT_SECRET'),
                expiresIn: 60,
            },
        )

        const refreshToken = this.jwtService.sign(
            {
                signature,
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

    async logOut(bearer: string): Promise<HttpStatusResult> {
        return {
            statusCode: 200,
            message: 'Logged out success!',
        }
    }
}
