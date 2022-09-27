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

@ApiTags('Authentication for UI')
@Controller('ui/authentication')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('/login/authentication-method/metamask')
    @ApiOperation({ summary: 'Nonce' })
    @ApiOkResponse({
        description: '200',
        type: NonceTokenDataResponse,
    })
    async getNonceToken(): Promise<NonceTokenDataResponse> {
        return this.authService.createNonce()
    }

    @Post('/login/authentication-method/metamask')
    @ApiOperation({ summary: 'Verify' })
    @ApiOkResponse({
        description: '200',
        type: TokenDataResponse,
    })
    async logInWithMetamask(
        @Body() dto: VerifySignatureDto,
    ): Promise<TokenDataResponse> {
        return this.authService.logInWithMetamask(dto)
    }

    @Post('/token')
    @ApiOperation({ summary: 'Refresh token' })
    @ApiOkResponse({
        description: '200',
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
    @ApiOkResponse({
        description: '200',
    })
    async logOut(@Req() req): Promise<HttpStatusResult> {
        const refreshToken = req.headers['refresh-token'] // read refresh-token from headers
        return this.authService.logOut(refreshToken)
    }
}
