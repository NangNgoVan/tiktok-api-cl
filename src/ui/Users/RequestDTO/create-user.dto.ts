import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class CreateUserDto {
    @ApiProperty()
    @IsString()
    full_name: string

    @ApiProperty()
    @IsString()
    nick_name: string

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    is_trial_user?: boolean
}
