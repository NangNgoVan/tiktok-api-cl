import bcrypt from 'bcrypt'
import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common'
import _ from 'lodash'

import { JwtService } from '@nestjs/jwt'
import { configService } from 'src/shared/Services/config.service'

import { LoginWithAuthenticationMethodCredentialRequestDto } from '../../../../shared/RequestDTO/login-with-authentication-method-credential-request.dto'

import { RefreshTokenBlacklistService } from '../../../../shared/Services/refresh-token-blacklist.service'
import { UserAuthenticationMethodsRepository } from '../Repository/user-authentication-methods.repository'
import { UsersRepository } from '../Repository/users.repository'
import { RefreshAccessTokenResponseDto } from '../../../../shared/ResponseDTO/refresh-token-response.dto'
import { AuthenticateResponseDto } from '../../../../shared/ResponseDTO/authenticate-response.dto'

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly jwtService: JwtService,
        private userRepository: UsersRepository,
        private userAuthenticationMethodsRepository: UserAuthenticationMethodsRepository,
        private blackListTokenService: RefreshTokenBlacklistService,
    ) {}

    async logInWithCredential(
        dto: LoginWithAuthenticationMethodCredentialRequestDto,
    ): Promise<AuthenticateResponseDto> {
        const userAuthenticationMethod =
            await this.userAuthenticationMethodsRepository.findByUsername(
                dto.username,
            )

        if (!userAuthenticationMethod) {
            throw new NotFoundException(`Username ${dto.username} not found`)
        }

        const user = await this.userRepository.findById(
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
                roles: _.get(user, 'roles', []),
                permissions: [], // FIXME: get permissions from roles
            }),
            refreshToken: this.generateRefreshToken({
                userId: user.id,
                roles: _.get(user, 'roles', []),
                permissions: [], // FIXME: get permissions from roles
            }),
        }
    }

    generateAccessToken(payload: {
        userId: string
        roles: string[]
        permissions: string[]
    }): string {
        return this.jwtService.sign(payload, {
            secret: configService.getEnv('JWT_SECRET'),
            expiresIn: '4h',
        })
    }

    generateRefreshToken(payload: {
        userId: string
        roles: string[]
        permissions: string[]
    }): string {
        return this.jwtService.sign(payload, {
            secret: configService.getEnv('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: '7 days',
        })
    }

    // verifyJWTToken(token: any, secretKey: string): string {
    //     try {
    //         const verifyToken = this.jwtService.verify(token, {
    //             secret: secretKey,
    //         })
    //
    //         return verifyToken
    //     } catch (error) {
    //         return null
    //     }
    // }

    async refreshAccessToken(
        userId: string,
    ): Promise<RefreshAccessTokenResponseDto> {
        const user = await this.userRepository.findById(userId)

        return {
            token: this.generateAccessToken({
                userId,
                roles: _.get(user, 'roles', []),
                permissions: [], // FIXME: get permissions from roles
            }),
        }
    }

    async logOut(refreshToken: string): Promise<void> {
        await this.blackListTokenService.addRefreshTokenToBlacklist(
            refreshToken,
        )
    }
}
