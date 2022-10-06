import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class CreateUserDto {
    @ApiProperty()
    @IsString()
    full_name: string

    @ApiProperty()
    @IsString()
    nick_name: string
}
