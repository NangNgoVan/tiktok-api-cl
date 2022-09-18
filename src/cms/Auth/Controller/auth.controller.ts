import { Body, Controller, 
        Get,
        HttpStatus,
        Post,
        Res,
     } from '@nestjs/common';
import { IDataResponse, TokenDataResponse, NonceTokenDataResponse } from 'src/shared/Services/data-serializer.service';
import { HttpStatusResult } from 'src/shared/Types/types';

import { AuthService } from 'src/shared/Services/auth.service';
import { CredentialDto } from 'src/shared/Dto/credential.dto';

@Controller('api/authentication')
export class AuthController {
    constructor (private readonly authService: AuthService) {

    }

    @Post('/authentication-method/credential')
    async logInWithCredential(@Body() dto: CredentialDto) : Promise<TokenDataResponse> {
        return this.authService.logInWithCredential(dto);
    }

    @Post('/logout')
    async logOut(bearer: string) : Promise<HttpStatusResult> {
        return this.authService.logOut();
    }
}
