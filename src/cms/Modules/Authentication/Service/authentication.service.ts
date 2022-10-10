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
import { RefreshAccessTokenResponseDto } from '../../../../shared/ResponseDTO/refresh-token-response.dto'
import { AuthenticateResponseDto } from '../../../../shared/ResponseDTO/authenticate-response.dto'
import { RolesRepository } from '../../Users/Repositories/roles.repository'
import { RolesService } from '../../Users/Service/roles.service'
import { UsersRepository } from '../../Users/Repositories/users.repository'
import { UserAuthenticationMethodsRepository } from '../../Users/Repositories/user-authentication-methods.repository'

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly userRepository: UsersRepository,
        private readonly roleRepository: RolesRepository,
        private readonly userAuthenticationMethodsRepository: UserAuthenticationMethodsRepository,
        private readonly jwtService: JwtService,
        private readonly blackListTokenService: RefreshTokenBlacklistService,
        private readonly roleService: RolesService,
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

        const user = await this.userRepository.findByById(
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

        console.log('user', user)

        const roles: string[] = _.get(user, 'roles', [])

        console.log('roles', roles)

        const effectivePermissions: string[] =
            await this.roleService.getEffectivePermissionsByRoles(roles)

        console.log('effectivePermissions', effectivePermissions)

        const payloadToGenerateToken = {
            userId: user.id,
            roles,
            permissions: effectivePermissions,
        }

        console.log('payloadtogeneratetoken', payloadToGenerateToken)

        return {
            token: this.generateAccessToken(payloadToGenerateToken),
            refreshToken: this.generateRefreshToken(payloadToGenerateToken),
        }
    }

    generateAccessToken(payload: {
        userId: string
        roles: string[]
        permissions: string[]
    }): string {
        return this.jwtService.sign(payload, {
            secret: configService.getEnv('JWT_SECRET'),
            expiresIn: 5 * 60, // 5m
        })
    }

    generateRefreshToken(payload: {
        userId: string
        roles: string[]
        permissions: string[]
    }): string {
        return this.jwtService.sign(payload, {
            secret: configService.getEnv('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: '1h',
        })
    }

    async refreshAccessToken(
        userId: string,
    ): Promise<RefreshAccessTokenResponseDto> {
        const user = await this.userRepository.findByById(userId)

        const roles: string[] = _.get(user, 'roles', [])

        const effectivePermissions: string[] =
            await this.roleService.getEffectivePermissionsByRoles(roles)

        return {
            token: this.generateAccessToken({
                userId,
                roles,
                permissions: effectivePermissions,
            }),
        }
    }

    async logOut(refreshToken: string): Promise<void> {
        await this.blackListTokenService.addRefreshTokenToBlacklist(
            refreshToken,
        )
    }
}
