import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Post,
    Req,
    Res,
    Headers,
    UseGuards,
    UnauthorizedException,
} from '@nestjs/common'
import {
    IDataResponse,
    TokenDataResponse,
    NonceTokenDataResponse,
} from 'src/shared/Services/data-serializer.service'
import { HttpStatusResult } from 'src/shared/Types/types'
import { VerifySignatureDto } from 'src/shared/Dto/verify-signature.dto'

import { AuthService } from 'src/shared/Services/auth.service'
import { JwtAuthGuard } from 'src/shared/Guards/jwt.auth.guard'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger'

@ApiTags('Authentication for UI')
@Controller('ui/authentication')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('/nonce')
    async getNonceToken(): Promise<NonceTokenDataResponse> {
        return this.authService.createNonce()
    }

    @Post('/authentication-method/metamask')
    async logInWithMetamask(
        @Body() dto: VerifySignatureDto,
    ): Promise<TokenDataResponse> {
        return this.authService.logInWithMetamask(dto)
    }

    @Post('/authentication/token')
    @ApiHeader({ name: 'refresh-token', description: 'refresh-token' })
    async refreshToken(@Req() req): Promise<TokenDataResponse> {
        const refreshToken = req.headers['refresh-token'] // read refresh-token from headers

        if (!refreshToken /**or refresh token not in the blacklist */) {
            throw new UnauthorizedException()
        }

        const tokenResponse = await this.authService.createJWTToken(60)
        return tokenResponse
    }

    @ApiBearerAuth()
    @Get('/logout')
    async logOut(
        @Headers('authorization') bearer: string,
    ): Promise<HttpStatusResult> {
        return this.authService.logOut(bearer)
    }
}
