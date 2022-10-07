import { Body, Controller, Get, Post, Req } from '@nestjs/common'
import {
    TokenDataResponse,
    NonceTokenDataResponse,
} from 'src/shared/Services/data-serializer.service'
import { HttpStatusResult } from 'src/shared/Types/types'
import { VerifySignatureDto } from 'src/shared/Dto/verify-signature.dto'

import { AuthService } from 'src/shared/Services/auth.service'
import {
    ApiHeader,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger'
import { CredentialDto } from '../../../shared/Dto/credential.dto'
import { SignUpWithAuthenticationMethodCredentialRequestDto } from './RequestDTO/signup-with-authentication-method-credential-request.dto'
import { UserResponseDto } from '../../Users/ResponseDTO/user-response.dto'

@ApiTags('Authentication APIs')
@Controller('ui/authentication')
export class AuthenticationController {
    constructor(private readonly authService: AuthService) {}

    @Post('/signup/authentication-methods/credential')
    @ApiOperation({
        summary: 'Signup with authentication method credential',
    })
    @ApiOkResponse({
        type: UserResponseDto,
    })
    async signupWithAuthenticationMethodCredential(
        @Body() dto: SignUpWithAuthenticationMethodCredentialRequestDto,
    ): Promise<UserResponseDto> {
        return this.authService.signupWithAuthenticationMethodCredential(dto)
    }

    @Get('/login/authentication-methods/metamask')
    @ApiOperation({ summary: 'Nonce' })
    @ApiOkResponse({
        type: NonceTokenDataResponse,
    })
    async getNonceToken(): Promise<NonceTokenDataResponse> {
        return this.authService.createNonce()
    }

    @Post('/login/authentication-methods/metamask')
    @ApiOperation({ summary: 'Login with metamask' })
    @ApiOkResponse({
        type: TokenDataResponse,
    })
    async logInWithMetamask(
        @Body() dto: VerifySignatureDto,
    ): Promise<TokenDataResponse> {
        return this.authService.logInWithMetamask(dto)
    }

    @Post('/login/authentication-methods/credential')
    @ApiOperation({ summary: 'Login with credential' })
    @ApiOkResponse({
        type: TokenDataResponse,
    })
    async logInWithCredential(
        @Body() dto: CredentialDto,
    ): Promise<TokenDataResponse> {
        return this.authService.logInWithCredential(dto)
    }

    // FIXME: ratelimit for this
    @Post('/login/authentication-methods/trial')
    @ApiOperation({ summary: 'Login as a trial user' })
    @ApiOkResponse({
        description: '200',
        type: TokenDataResponse,
    })
    async loginAsAGuest(): Promise<TokenDataResponse> {
        return this.authService.logInAsATrialUser()
    }

    @Post('/token')
    @ApiOperation({ summary: 'Refresh token' })
    @ApiOkResponse({
        type: TokenDataResponse,
    })
    @ApiHeader({
        name: 'refresh-token',
        description: 'refresh token',
        required: true,
    })
    async refreshToken(@Req() req): Promise<TokenDataResponse> {
        return this.authService.refreshAccessToken(req.userId)
    }

    @Post('/logout')
    @ApiHeader({
        name: 'refresh-token',
        description: 'refresh token',
        required: true,
    })
    @ApiOperation({ summary: 'Logout' })
    @ApiOkResponse({})
    async logOut(@Req() req): Promise<HttpStatusResult> {
        const refreshToken = req.headers['refresh-token'] // read refresh-token from headers
        return this.authService.logOut(refreshToken)
    }
}
