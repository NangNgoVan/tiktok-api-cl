import { ApiProperty } from '@nestjs/swagger'
import { AuthenticationMethod } from '../../../../shared/Types/types'

export class MetamaskAuthenticationMethodData {
    @ApiProperty({
        required: true,
        type: String,
    })
    address: string
}

export class GetUserAuthenticationMethodResponseDto {
    @ApiProperty({
        type: String,
        required: true,
    })
    _id: string

    @ApiProperty({
        required: true,
        enum: AuthenticationMethod,
    })
    authentication_method: AuthenticationMethod

    @ApiProperty({
        required: false,
        type: MetamaskAuthenticationMethodData,
    })
    data?: MetamaskAuthenticationMethodData
}
