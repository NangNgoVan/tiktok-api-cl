import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common'
import {
    IDataResponse,
    TokenDataResponse,
    NonceTokenDataResponse,
} from 'src/shared/Services/data-serializer.service'
import { HttpStatusResult } from 'src/shared/Types/types'
import { CredentialDto } from 'src/shared/Dto/credential.dto'

import { AuthenticationService } from 'src/ui/Authentication/Service/authentication.service'

@Controller('cms/authentication')
export class AuthController {
    constructor(private readonly authService: AuthenticationService) {}

    @Post('/authentication-methods/credential')
    async logInWithCredential(
        @Body() dto: CredentialDto,
    ): Promise<TokenDataResponse> {
        return this.authService.logInWithCredential(dto)
    }

    @Post('/logout')
    async logOut(bearer: string): Promise<HttpStatusResult> {
        return {
            statusCode: HttpStatus.OK,
            message: 'Logout ok!',
        }
    }
}
