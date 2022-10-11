import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsString } from 'class-validator'

export class CreateRoleRequestDto {
    @ApiProperty()
    @IsString()
    // FIXME: length validation
    name: string


    @ApiProperty()
    // @IsString()
    @IsArray()
    permissions: string[]
}
