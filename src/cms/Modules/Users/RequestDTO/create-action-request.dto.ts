import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CreateActionRequestDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(25)
    name: string
}
