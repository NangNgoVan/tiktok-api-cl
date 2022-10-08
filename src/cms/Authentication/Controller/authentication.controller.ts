import { Body, Controller, Post, Req } from '@nestjs/common'
import { AuthenticationService } from '../Service/authentication.service'
import { LoginWithAuthenticationMethodCredentialRequestDto } from '../../../shared/RequestDTO/login-with-authentication-method-credential-request.dto'
import { ApiHeader, ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { RefreshAccessTokenResponseDto } from '../../../shared/ResponseDTO/refresh-token-response.dto'
import { AuthenticateResponseDto } from '../../../shared/ResponseDTO/authenticate-response.dto'

@Controller('cms/authentication')
export class AuthenticationController {
    constructor(
        private readonly authenticationService: AuthenticationService,
    ) {}

    @Post('/authentication-methods/credential')
    async logInWithCredential(
        @Body()
        loginWithAuthenticationMethodCredentialRequestDto: LoginWithAuthenticationMethodCredentialRequestDto,
    ): Promise<AuthenticateResponseDto> {
        return this.authenticationService.logInWithCredential(
            loginWithAuthenticationMethodCredentialRequestDto,
        )
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
