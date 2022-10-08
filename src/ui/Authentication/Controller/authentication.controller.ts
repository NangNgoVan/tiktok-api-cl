import { Body, Controller, Get, Post, Req } from '@nestjs/common'
import { LoginWithAuthenticationMethodMetamaskRequestDto } from 'src/shared/RequestDTO/login-with-authentication-method-metamask-request.dto'

import { AuthenticationService } from 'src/ui/Authentication/Service/authentication.service'
import {
    ApiHeader,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger'
import { LoginWithAuthenticationMethodCredentialRequestDto } from '../../../shared/RequestDTO/login-with-authentication-method-credential-request.dto'
import { SignUpWithAuthenticationMethodCredentialRequestDto } from './RequestDTO/signup-with-authentication-method-credential-request.dto'
import { AuthenticateResponseDto } from '../../../shared/ResponseDTO/authenticate-response.dto'
import { RefreshAccessTokenResponseDto } from '../../../shared/ResponseDTO/refresh-token-response.dto'
import { NonceResponseDto } from '../../../shared/ResponseDTO/nonce-response.dto'

@ApiTags('Authentication APIs')
@Controller('ui/authentication')
export class AuthenticationController {
    constructor(
        private readonly authenticationService: AuthenticationService,
    ) {}

    @Post('/signup/authentication-methods/credential')
    @ApiOperation({
        summary: 'Signup with authentication method credential',
    })
    @ApiOkResponse({
        type: AuthenticateResponseDto,
    })
    async signupWithAuthenticationMethodCredential(
        @Body() dto: SignUpWithAuthenticationMethodCredentialRequestDto,
    ): Promise<AuthenticateResponseDto> {
        return this.authenticationService.signupWithAuthenticationMethodCredential(
            dto,
        )
    }

    @Get('/login/authentication-methods/metamask')
    @ApiOperation({ summary: 'Nonce' })
    @ApiOkResponse({
        type: AuthenticateResponseDto,
    })
    async getNonceToken(): Promise<NonceResponseDto> {
        return this.authenticationService.createNonce()
    }

    @Post('/login/authentication-methods/metamask')
    @ApiOperation({ summary: 'Login with metamask' })
    @ApiOkResponse({
        type: AuthenticateResponseDto,
    })
    async logInWithMetamask(
        @Body() dto: LoginWithAuthenticationMethodMetamaskRequestDto,
    ): Promise<AuthenticateResponseDto> {
        return this.authenticationService.logInWithMetamask(dto)
    }

    @Post('/login/authentication-methods/credential')
    @ApiOperation({ summary: 'Login with credential' })
    @ApiOkResponse({
        type: AuthenticateResponseDto,
    })
    async logInWithCredential(
        @Body() dto: LoginWithAuthenticationMethodCredentialRequestDto,
    ): Promise<AuthenticateResponseDto> {
        return this.authenticationService.logInWithCredential(dto)
    }

    // FIXME: ratelimit for this
    @Post('/login/authentication-methods/trial')
    @ApiOperation({ summary: 'Login as a trial user' })
    @ApiOkResponse({
        description: '200',
        type: AuthenticateResponseDto,
    })
    async loginAsAGuest(): Promise<AuthenticateResponseDto> {
        return this.authenticationService.logInAsATrialUser()
    }

    @Post('/token')
    @ApiOperation({ summary: 'Refresh token' })
    @ApiOkResponse({
        type: RefreshAccessTokenResponseDto,
    })
    @ApiHeader({
        name: 'refresh-token',
        description: 'refresh token',
        required: true,
    })
    async refreshToken(@Req() req): Promise<RefreshAccessTokenResponseDto> {
        return this.authenticationService.refreshAccessToken(req.userId)
    }

    @Post('/logout')
    @ApiHeader({
        name: 'refresh-token',
        description: 'refresh token',
        required: true,
    })
    @ApiOperation({ summary: 'Logout' })
    @ApiOkResponse()
    async logOut(@Req() req): Promise<void> {
        const refreshToken = req.headers['refresh-token']
        await this.authenticationService.logOut(refreshToken)
    }
}
