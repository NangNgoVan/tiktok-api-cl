import { ApiProperty } from '@nestjs/swagger'
import {
    ArrayMinSize,
    IsArray,
    IsNotEmpty,
    IsString,
    MaxLength,
} from 'class-validator'

export class CreateOrUpdateRoleRequestDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(25)
    name: string

    @ApiProperty()
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    permissions: string[]
}
