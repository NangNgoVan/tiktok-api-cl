// Nest dependencies
import bcrypt from 'bcrypt'
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
import { AuthenticationMethod, HttpStatusResult } from '../Types/types'
import { UsersService } from 'src/ui/Users/Service/users.service'

import { UserAuthenticationMethodsService } from 'src/ui/Users/Service/user-authentication-methods.service'
import { UserDocument } from '../Schemas/user.schema'
import { UserNotFoundException } from '../Exceptions/http.exceptions'
import { BlacklistService } from './blacklist-redis.service'

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private userService: UsersService,
        private userAuthenticationMethodsService: UserAuthenticationMethodsService,
        private blackListService: BlacklistService,
    ) {}

    async createNonce(): Promise<NonceTokenDataResponse> {
        const nonceCreatedByCrypto = crypto.randomBytes(16).toString('base64')

        const dataResponse = {
            nonce: nonceCreatedByCrypto,
        }

        return dataResponse
    }

    async verifyMetamaskAddress(nonce, signature, address) {
        const web3 = new Web3()

        const verifiedAddress = web3.eth.accounts.recover(nonce, signature)

        if (!verifiedAddress) {
            return false
        }

        if (address !== verifiedAddress) {
            return false
        }

        return verifiedAddress
    }

    async logInWithMetamask(
        dto: VerifySignatureDto,
    ): Promise<TokenDataResponse> {
        const verifiedAddress = await this.verifyMetamaskAddress(
            dto.nonce,
            dto.signature,
            dto.address,
        )

        if (!verifiedAddress) {
            throw new UnauthorizedException()
        }

        const userAuthenticationMethod =
            await this.userAuthenticationMethodsService.findByAddress(
                verifiedAddress,
            )

        let user: UserDocument

        if (!userAuthenticationMethod) {
            const uuidNoHyphens = uuidv4().replace(/-/g, '')
            user = await this.userService.create({
                full_name: `user ${uuidNoHyphens}`,
                nick_name: `user${uuidNoHyphens}`,
            })

            await this.userAuthenticationMethodsService.createAuthenticationMethod(
                {
                    user_id: user.id,
                    data: { address: verifiedAddress },
                    authentication_method: AuthenticationMethod.METAMASK,
                },
            )
        } else {
            user = await this.userService.findById(
                userAuthenticationMethod.user_id,
            )
        }

        if (!user) {
            throw new UserNotFoundException()
        }

        return {
            token: this.generateAccessToken({
                userId: user.id,
            }),
            refreshToken: this.generateRefreshToken({
                userId: user.id,
            }),
        }
    }

    async logInWithCredential(dto: CredentialDto): Promise<TokenDataResponse> {
        const userAuthenticationMethod =
            await this.userAuthenticationMethodsService.findByUsername(
                dto.username,
            )

        if (!userAuthenticationMethod) {
            throw new NotFoundException(`Username ${dto.username} not found`)
        }

        const user = await this.userService.findById(
            userAuthenticationMethod.user_id,
        )

        if (!user) {
            throw new NotFoundException(
                `User ${userAuthenticationMethod.user_id} not found`,
            )
        }

        const { password } = userAuthenticationMethod.data as {
            username: string
            password: string
        }

        const isPasswordValid = await bcrypt.compare(dto.password, password)

        if (!isPasswordValid) {
            throw new BadRequestException('Password do not match')
        }

        return {
            token: this.generateAccessToken({
                userId: user.id,
            }),
            refreshToken: this.generateRefreshToken({
                userId: user.id,
            }),
        }
    }

    generateAccessToken(payload: { userId: string }): string {
        return this.jwtService.sign(payload, {
            secret: configService.getEnv('JWT_SECRET'),
            expiresIn: '4h',
        })
    }

    generateRefreshToken(payload: { userId: string }): string {
        return this.jwtService.sign(payload, {
            secret: configService.getEnv('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: '7 days',
        })
    }

    verifyJWTToken(token: any, secretKey: string): string {
        try {
            const verifyToken = this.jwtService.verify(token, {
                secret: secretKey,
            })

            return verifyToken
        } catch (error) {
            return null
        }
    }

    async refreshAccessToken(userId: string): Promise<TokenDataResponse> {
        return {
            token: this.generateAccessToken({
                userId,
            }),
        }
    }

    async logOut(refreshToken: string): Promise<HttpStatusResult> {
        this.blackListService.addJwtToken(refreshToken)
        return {
            statusCode: 200,
            message: 'Logged out success!',
        }
    }
}
