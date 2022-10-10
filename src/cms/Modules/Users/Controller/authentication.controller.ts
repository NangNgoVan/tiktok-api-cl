import { Body, Controller, Post, Req } from '@nestjs/common'
import { AuthenticationService } from '../Service/authentication.service'
import { LoginWithAuthenticationMethodCredentialRequestDto } from '../../../../shared/RequestDTO/login-with-authentication-method-credential-request.dto'
import { ApiHeader, ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { RefreshAccessTokenResponseDto } from '../../../../shared/ResponseDTO/refresh-token-response.dto'
import { AuthenticateResponseDto } from '../../../../shared/ResponseDTO/authenticate-response.dto'
import { IsPublic } from '../../../../shared/Decorators/is-public.decorator'

@Controller('cms/authentication')
export class AuthenticationController {
    constructor(
        private readonly authenticationService: AuthenticationService,
    ) {}

    @IsPublic()
    @Post('/authentication-methods/credential')
    @ApiOperation({ summary: 'Login with credential' })
    @ApiOkResponse({
        type: RefreshAccessTokenResponseDto,
    })
    async logInWithCredential(
        @Body()
        loginWithAuthenticationMethodCredentialRequestDto: LoginWithAuthenticationMethodCredentialRequestDto,
    ): Promise<AuthenticateResponseDto> {
        return this.authenticationService.logInWithCredential(
            loginWithAuthenticationMethodCredentialRequestDto,
        )
    }

    @IsPublic()
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

    @IsPublic()
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
