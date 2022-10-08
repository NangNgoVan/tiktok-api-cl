import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class LoginWithAuthenticationMethodMetamaskRequestDto {
    @IsString()
    @ApiProperty({
        required: true,
    })
    nonce: string

    @IsString()
    @ApiProperty({
        required: true,
    })
    address: string

    @IsString()
    @ApiProperty({
        required: true,
    })
    signature: string
}
