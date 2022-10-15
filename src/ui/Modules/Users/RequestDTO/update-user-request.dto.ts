import { ApiProperty } from '@nestjs/swagger'
import {
    IsArray,
    IsBoolean,
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator'
import { UserGenderType } from 'src/shared/Types/types'

export class UpdateUserRequestDto {
    @IsEnum(UserGenderType)
    @IsOptional()
    @ApiProperty({
        required: false,
    })
    gender?: UserGenderType

    @IsString()
    @MaxLength(100)
    @IsOptional()
    @ApiProperty({
        required: false,
    })
    @IsEmail()
    email?: string

    @IsString({})
    @IsOptional()
    @ApiProperty({
        required: false,
    })
    birth_day?: string

    @IsString()
    @MaxLength(30)
    @IsOptional()
    @ApiProperty({
        required: false,
    })
    full_name?: string

    @IsString()
    @MaxLength(30)
    @IsOptional()
    @ApiProperty({
        required: false,
    })
    nick_name?: string

    @IsString()
    @MaxLength(30)
    @IsOptional()
    @ApiProperty({
        required: false,
    })
    bio?: string

    @IsString()
    @MaxLength(50)
    @IsOptional()
    @ApiProperty({
        required: false,
    })
    facebook?: string

    @IsString()
    @MaxLength(50)
    @IsOptional()
    @ApiProperty({
        required: false,
    })
    twitter?: string

    @IsString()
    @MaxLength(50)
    @IsOptional()
    @ApiProperty({
        required: false,
    })
    instagram?: string

    @IsString()
    @MaxLength(50)
    @IsOptional()
    @ApiProperty({
        required: false,
    })
    address?: string

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        required: false,
    })
    should_show_account_setup_flow?: boolean

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        required: false,
    })
    should_show_tour_guild?: boolean

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        required: false,
    })
    is_trial_user?: boolean
}
