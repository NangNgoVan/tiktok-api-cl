import { Controller, NotImplementedException, Post } from '@nestjs/common'
import { TokenDataResponse } from 'src/shared/Services/data-serializer.service'
import { HttpStatusResult } from 'src/shared/Types/types'

@Controller('cms/authentication')
export class AuthenticationController {
    // constructor() {}

    @Post('/authentication-methods/credential')
    async logInWithCredential(): // @Body() dto: CredentialDto,
    Promise<TokenDataResponse> {
        throw new NotImplementedException()
    }

    @Post('/logout')
    async logOut(): Promise<HttpStatusResult> {
        throw new NotImplementedException()
    }
}
