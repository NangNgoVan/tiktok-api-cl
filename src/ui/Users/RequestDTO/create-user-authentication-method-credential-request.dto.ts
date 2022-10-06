import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class CreateUserAuthenticationMethodCredentialRequestDto {
    @ApiProperty()
    @IsString()
    username: string

    @ApiProperty()
    @IsString()
    password: string

    @ApiProperty()
    @IsString()
    password_confirmation: string
}
