import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Post,
    Req,
    Res,
} from '@nestjs/common'
import {
    IDataResponse,
    TokenDataResponse,
    NonceTokenDataResponse,
} from 'src/shared/Services/data-serializer.service'
import { HttpStatusResult } from 'src/shared/Types/types'
import { VerifySignatureDto } from 'src/shared/Dto/verify-signature.dto'

import { AuthService } from 'src/shared/Services/auth.service'

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

    @Post('/authenticaton/token')
    async refreshToken(@Req() req): Promise<TokenDataResponse> {
        const response = {
            token: 'token',
            refreshToken: 'refresh-token',
        }

        return response
    }

    @Post('/logout')
    async logOut(bearer: string): Promise<HttpStatusResult> {
        return {
            statusCode: HttpStatus.OK,
            message: 'Logout ok!',
        }
    }
}
