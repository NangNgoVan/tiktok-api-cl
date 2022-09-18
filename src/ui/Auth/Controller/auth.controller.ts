import { Body, Controller, 
        Get,
        HttpStatus,
        Post,
        Res,
     } from '@nestjs/common';
import { IDataResponse, TokenDataResponse, NonceTokenDataResponse } from 'src/shared/Services/data-serializer.service';
import { HttpStatusResult } from 'src/shared/Types/types';

import { AuthService } from 'src/shared/Services/auth.service';
import { CreateSignatureDto } from 'src/shared/Dto/create-signature.dto';

@Controller('api/authentication')
export class AuthController {
    constructor (private readonly authService: AuthService) {

    }

    @Get('/nonce')
    async getNonceToken() : Promise<NonceTokenDataResponse> {
        return this.authService.createNonce();
    }

    @Post('/authentication-method/metamask')
    async logInWithMetamask(@Body() dto: CreateSignatureDto) : Promise<TokenDataResponse> {
        return this.authService.logInWithMetamask(dto);
    }

    @Post('/logout')
    async logOut(bearer: string) : Promise<HttpStatusResult> {
        return this.authService.logOut();
    }
}
