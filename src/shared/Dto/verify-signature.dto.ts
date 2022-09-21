import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class VerifySignatureDto {
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
