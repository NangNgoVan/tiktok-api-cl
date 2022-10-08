import { ApiProperty } from '@nestjs/swagger'

export class NonceResponseDto {
    @ApiProperty()
    nonce: string
}
