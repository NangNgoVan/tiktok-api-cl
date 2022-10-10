import { ApiProperty } from '@nestjs/swagger'
import { AuthenticationMethod } from '../../../../shared/Types/types'

export class CreateUserAuthenticationMethodResponseDto {
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
}
