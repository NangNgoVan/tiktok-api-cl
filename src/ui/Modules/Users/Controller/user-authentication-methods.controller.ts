import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Post,
    Req,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common'

import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger'
import { UserAuthenticationMethodsService } from '../Service/user-authentication-methods.service'
import { AuthenticationMethod } from '../../../../shared/Types/types'
import { JwtAuthGuard } from '../../../../shared/Guards/jwt.auth.guard'
import bcrypt from 'bcrypt'
import _ from 'lodash'
import { GetUserAuthenticationMethodResponseDto } from '../ResponseDTO/get-user-authentication-method-response.dto'
import { CreateUserAuthenticationMethodResponseDto } from '../ResponseDTO/create-user-authentication-method-response.dto'
import { CreateUserAuthenticationMethodCredentialRequestDto } from '../RequestDTO/create-user-authentication-method-credential-request.dto'
import { CreateUserAuthenticationMethodMetamaskRequestDto } from '../RequestDTO/create-user-authentication-method-metamask-request.dto'
import { AuthenticationService } from '../../Authentication/Service/authentication.service'
import { UsersService } from '../Service/users.service'
import { NonceResponseDto } from '../../../../shared/ResponseDTO/nonce-response.dto'

@ApiTags('User Authentication Method APIs')
@Controller('ui/users/current/authentication-methods')
export class UserAuthenticationMethodsController {
    constructor(
        private readonly authenticationMethodsService: UserAuthenticationMethodsService,
        private readonly authenticationService: AuthenticationService,
        private readonly userService: UsersService,
        private readonly authService: AuthenticationService,
    ) {}

    @Get()
    @UsePipes(new ValidationPipe())
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get all authentication methods by `current` alias',
    })
    @ApiOkResponse({
        type: GetUserAuthenticationMethodResponseDto,
        isArray: true,
    })
    async getAllAuthenticationMethodsByCurrentUser(
        @Req() req,
    ): Promise<GetUserAuthenticationMethodResponseDto[]> {
        const userId = req.user.userId

        const authenticationMethods =
            await this.authenticationMethodsService.getAllAuthenticationMethodsByUserId(
                userId,
            )

        return _.map(authenticationMethods, (authenticationMethod) => ({
            ..._.pick(authenticationMethod, ['_id', 'authentication_method']),
            data:
                authenticationMethod.authentication_method === 'metamask'
                    ? {
                          address: _.get(authenticationMethod, 'data.address'),
                      }
                    : undefined,
        }))
    }

    @Post('credential')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Create authentication method credential by `current` alias',
    })
    @ApiOkResponse({
        type: CreateUserAuthenticationMethodResponseDto,
    })
    async createAuthenticationMethodCredential(
        @Req() req,
        @Body()
        createUserAuthenticationMethodCredentialDto: CreateUserAuthenticationMethodCredentialRequestDto,
    ): Promise<CreateUserAuthenticationMethodResponseDto> {
        const userId = req.user.userId

        const { username, password, password_confirmation } =
            createUserAuthenticationMethodCredentialDto

        if (password !== password_confirmation) {
            throw new BadRequestException(
                'Password confirmation does not match',
            )
        }

        const credentialAuthenticationMethod =
            await this.authenticationMethodsService.findByUserIdAndAuthenticationMethod(
                userId,
                AuthenticationMethod.CREDENTIAL,
            )

        if (credentialAuthenticationMethod) {
            throw new BadRequestException(
                'Credential authentication method already exists',
            )
        }

        const authenticationMethod =
            await this.authenticationMethodsService.findByUsername(username)

        if (authenticationMethod) {
            throw new BadRequestException(`Username ${username} already exists`)
        }

        const salt = await bcrypt.genSalt(10)
        const hashed = await bcrypt.hash(password, salt)

        const createdUserAuthenticationMethod =
            await this.authenticationMethodsService.createAuthenticationMethod({
                authentication_method: AuthenticationMethod.CREDENTIAL,
                data: {
                    username,
                    password: hashed,
                },
                user_id: userId,
            })

        await this.userService.updateUser(userId, {
            is_trial_user: false,
        })

        return _.omit(createdUserAuthenticationMethod, ['data', 'user_id'])
    }

    // FIXME: move logic from controller to service

    @Post('metamask')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Create authentication method metamask by `current` alias',
    })
    @ApiOkResponse({
        type: CreateUserAuthenticationMethodResponseDto,
    })
    async createAuthenticationMethodMetamask(
        @Req() req,
        @Body()
        createUserAuthenticationMethodMetamaskDto: CreateUserAuthenticationMethodMetamaskRequestDto,
    ): Promise<CreateUserAuthenticationMethodResponseDto> {
        const userId = req.user.userId

        const { address, signature, nonce } =
            createUserAuthenticationMethodMetamaskDto

        const verifiedAddress =
            await this.authenticationService.verifyMetamaskAddress(
                nonce,
                signature,
                address,
            )

        if (!verifiedAddress) {
            throw new BadRequestException(
                `Metamask address ${address} is invalid`,
            )
        }

        const metamaskAuthenticationMethod =
            await this.authenticationMethodsService.findByUserIdAndAuthenticationMethod(
                userId,
                AuthenticationMethod.METAMASK,
            )

        if (metamaskAuthenticationMethod) {
            throw new BadRequestException(
                'Metamask authentication method already exists',
            )
        }

        const authenticationMethod =
            await this.authenticationMethodsService.findByAddress(
                verifiedAddress,
            )

        if (authenticationMethod) {
            throw new BadRequestException(
                `Metamask address ${address} already exists`,
            )
        }

        const createdUserAuthenticationMethod =
            await this.authenticationMethodsService.createAuthenticationMethod({
                authentication_method: AuthenticationMethod.METAMASK,
                data: {
                    address: verifiedAddress,
                },
                user_id: userId,
            })

        await this.userService.updateUser(userId, {
            is_trial_user: false,
        })

        return _.omit(createdUserAuthenticationMethod, ['data', 'user_id'])
    }

    @Get('metamask')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary:
            'Get nonce to create authentication method metamask by `current` alias',
    })
    @ApiOkResponse({
        type: NonceResponseDto,
    })
    async getNonceToAuthenticationMethodMetamask(): Promise<NonceResponseDto> {
        return this.authService.createNonce()
    }

    @Delete('metamask')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary:
            '[Test purpose] Delete authentication method metamask by `current` alias',
    })
    @ApiOkResponse()
    async deleteAuthenticationMethodMetamask(@Req() req) {
        const userId = req.user.userId
        await this.authenticationMethodsService.deleteByUserIdAndAuthenticationMethod(
            userId,
            AuthenticationMethod.METAMASK,
        )
    }
}
