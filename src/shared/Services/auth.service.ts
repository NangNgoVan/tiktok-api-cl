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

        const dataResponse = {
            token: token,
            refreshToken: 'refresh-token',
        }

        return dataResponse
    }

    async logInWithCredential(dto: CredentialDto): Promise<TokenDataResponse> {
        const token = 'token'

        const dataResponse = {
            token: token,
            refreshToken: 'refresh-token',
        }

        return dataResponse
    }
}
