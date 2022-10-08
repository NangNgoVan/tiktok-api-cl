import { ApiProperty } from '@nestjs/swagger'

export class AuthenticateResponseDto {
    @ApiProperty()
    token: string

    @ApiProperty()
    refreshToken: string
}
