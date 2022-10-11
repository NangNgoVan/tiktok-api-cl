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
import { RolesRepository } from '../../Users/Repository/roles.repository'
import { RolesService } from '../../Users/Service/roles.service'
import { UsersRepository } from '../../Users/Repository/users.repository'
import { UserAuthenticationMethodsRepository } from '../../Users/Repository/user-authentication-methods.repository'
import { UserRolesService } from '../../Users/Service/user-roles.service'

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly userRepository: UsersRepository,
        private readonly roleRepository: RolesRepository,
        private readonly userAuthenticationMethodsRepository: UserAuthenticationMethodsRepository,
        private readonly jwtService: JwtService,
        private readonly blackListTokenService: RefreshTokenBlacklistService,
        private readonly roleService: RolesService,
        private readonly userRolesService: UserRolesService,
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

        const user = await this.userRepository.getById(
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

        const roles: string[] = _.get(user, 'roles', [])

        const [effectivePermissions] = await Promise.all([
            this.roleService.getEffectivePermissionsByRoles(roles),
            this.userRolesService.reconcileRolesForUser(user.id),
        ])

        const payloadToGenerateToken = {
            userId: user.id,
            roles,
            permissions: effectivePermissions,
        }

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
        const user = await this.userRepository.getById(userId)

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
