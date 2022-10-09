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

import Web3 from 'web3'
import * as crypto from 'crypto'

import { LoginWithAuthenticationMethodMetamaskRequestDto } from '../../../shared/RequestDTO/login-with-authentication-method-metamask-request.dto'
import { LoginWithAuthenticationMethodCredentialRequestDto } from '../../../shared/RequestDTO/login-with-authentication-method-credential-request.dto'
import { AuthenticationMethod } from '../../../shared/Types/types'
import { UsersService } from 'src/ui/Users/Service/users.service'

import { UserAuthenticationMethodsService } from 'src/ui/Users/Service/user-authentication-methods.service'
import { UserDocument } from '../../../shared/Schemas/user.schema'
import { UserNotFoundException } from '../../../shared/Exceptions/http.exceptions'
import { RefreshTokenBlacklistService } from '../../../shared/Services/refresh-token-blacklist.service'
import { SignUpWithAuthenticationMethodCredentialRequestDto } from '../Controller/RequestDTO/signup-with-authentication-method-credential-request.dto'
import { AuthenticateResponseDto } from '../../../shared/ResponseDTO/authenticate-response.dto'
import { RefreshAccessTokenResponseDto } from '../../../shared/ResponseDTO/refresh-token-response.dto'
import { NonceResponseDto } from '../../../shared/ResponseDTO/nonce-response.dto'

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly jwtService: JwtService,
        private userService: UsersService,
        private userAuthenticationMethodsService: UserAuthenticationMethodsService,
        private refreshTokenBlackListService: RefreshTokenBlacklistService,
    ) {}

    async createNonce(): Promise<NonceResponseDto> {
        const nonce = crypto.randomBytes(16).toString('base64')
        return {
            nonce,
        }
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
        dto: LoginWithAuthenticationMethodMetamaskRequestDto,
    ): Promise<AuthenticateResponseDto> {
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
                is_trial_user: false,
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

    async logInAsATrialUser(): Promise<AuthenticateResponseDto> {
        const uuidNoHyphens = uuidv4().replace(/-/g, '')

        const user: UserDocument = await this.userService.create({
            full_name: `trial ${uuidNoHyphens}`,
            nick_name: `trial${uuidNoHyphens}`,
            is_trial_user: true,
        })

        await this.userAuthenticationMethodsService.createAuthenticationMethod({
            user_id: user.id,
            // FIXME: should store device id or ip
            data: undefined,
            authentication_method: AuthenticationMethod.TRIAL,
        })

        return {
            token: this.generateAccessToken({
                userId: user.id,
            }),
            refreshToken: this.generateRefreshToken({
                userId: user.id,
            }),
        }
    }

    async logInWithCredential(
        dto: LoginWithAuthenticationMethodCredentialRequestDto,
    ): Promise<AuthenticateResponseDto> {
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

    async refreshAccessToken(
        userId: string,
    ): Promise<RefreshAccessTokenResponseDto> {
        return {
            token: this.generateAccessToken({
                userId,
            }),
        }
    }

    async logOut(refreshToken: string): Promise<void> {
        await this.refreshTokenBlackListService.addRefreshTokenToBlacklist(
            refreshToken,
        )
    }

    async signupWithAuthenticationMethodCredential(
        signupWithAuthenticationMethodCredentialRequestDto: SignUpWithAuthenticationMethodCredentialRequestDto,
    ) {
        const { username, password, password_confirmation } =
            signupWithAuthenticationMethodCredentialRequestDto

        if (password !== password_confirmation) {
            throw new BadRequestException(
                'Password confirmation does not match',
            )
        }

        const authenticationMethod =
            await this.userAuthenticationMethodsService.findByUsername(username)

        if (authenticationMethod) {
            throw new BadRequestException(`Username ${username} already exists`)
        }

        const uuidNoHyphens = uuidv4().replace(/-/g, '')

        const user = await this.userService.create({
            full_name: `user ${uuidNoHyphens}`,
            nick_name: `user${uuidNoHyphens}`,
            is_trial_user: false,
        })

        const salt = await bcrypt.genSalt(10)
        const hashed = await bcrypt.hash(password, salt)

        await this.userAuthenticationMethodsService.createAuthenticationMethod({
            authentication_method: AuthenticationMethod.CREDENTIAL,
            data: {
                username,
                password: hashed,
            },
            user_id: user.id,
        })

        // FIXME: move this to a function
        return {
            token: this.generateAccessToken({
                userId: user.id,
            }),
            refreshToken: this.generateRefreshToken({
                userId: user.id,
            }),
        }
    }
}
