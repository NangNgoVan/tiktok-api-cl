import { Body, Controller, 
        Get,
        HttpStatus,
        Post,
        Res,
        Inject,
        CacheKey
     } from '@nestjs/common';
import { IDataResponse, TokenDataResponse, NonceTokenDataResponse } from 'src/shared/Services/data-serializer.service';
import { HttpStatusResult } from 'src/shared/Types/types'

import { AuthService } from 'src/shared/Services/auth.service'
import { CreateSignatureDto } from 'src/shared/Dto/create-signature.dto'

import { RedisCacheService } from 'src/shared/Services/redis-cache.service'

@Controller('api/authentication')
export class AuthController {
    constructor (private readonly authService: AuthService, 
        private readonly cacheService: RedisCacheService
    ) {

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
        return this.authService.logOut()
    }

    @CacheKey('cache-key')
    @Get('/cache')
    async getCache() {
        var v = undefined
        try {
            console.log('Try to set cache');
            await this.cacheService.set('key', 'value')
            console.log('Try to get cache');
            const val = await this.cacheService.get('key')
            console.log(val)
        }
        finally
        {
            return v
        }
    }
}
