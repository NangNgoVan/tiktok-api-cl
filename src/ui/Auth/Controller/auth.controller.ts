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
import {
    ApiBearerAuth,
    ApiHeader,
    ApiOkResponse,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { configService } from 'src/shared/Services/config.service'
import { RefreshTokenInvalidException } from 'src/shared/Exceptions/http.exceptions'

@ApiTags('Authentication for UI')
@Controller('ui/authentication')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('/login/authentication-method/metamask')
    @ApiOperation({ summary: 'nonce' })
    @ApiOkResponse({
        description: '200',
        type: NonceTokenDataResponse,
    })
    async getNonceToken(): Promise<NonceTokenDataResponse> {
        return this.authService.createNonce()
    }

    @Post('/login/authentication-method/metamask')
    @ApiOperation({ summary: 'verify' })
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
    @ApiOperation({ summary: 'refresh token' })
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
        const userId = req.userId

        const signedData = {
            userId: userId,
        }
        const tokenResponse = await this.authService.createJWTToken(
            signedData,
            configService.getEnv('JWT_SECRET'),
            60,
        )
        return tokenResponse
    }

    @Post('/logout')
    @ApiHeader({
        name: 'refresh-token',
        description: 'refresh token',
        required: true,
    })
    @ApiOperation({ summary: 'logout' })
    @ApiOkResponse({
        description: '200',
    })
    async logOut(@Req() req): Promise<HttpStatusResult> {
        const refreshToken = req.headers['refresh-token'] // read refresh-token from headers
        return this.authService.logOut(refreshToken)
    }
}
