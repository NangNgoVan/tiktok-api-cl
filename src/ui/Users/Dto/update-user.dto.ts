import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class UpdateUserDto {
    @IsString()
    @ApiProperty()
    username: string

    @IsString()
    @ApiProperty()
    avatar: string
}
