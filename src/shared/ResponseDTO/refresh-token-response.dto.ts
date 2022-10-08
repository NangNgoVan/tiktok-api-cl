import { ApiProperty } from '@nestjs/swagger'

export class RefreshAccessTokenResponseDto {
    @ApiProperty()
    token: string
}
