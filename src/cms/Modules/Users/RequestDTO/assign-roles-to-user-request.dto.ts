import { ApiProperty } from '@nestjs/swagger'
import { ArrayMinSize, IsArray, IsString } from 'class-validator'

export class AssignRolesToUserRequestDto {
    @ApiProperty()
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    roles: string[]
}
