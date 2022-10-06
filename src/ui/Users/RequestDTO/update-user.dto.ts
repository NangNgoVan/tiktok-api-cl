import { ApiProperty } from '@nestjs/swagger'
import {
    IsArray,
    IsBoolean,
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    Matches,
} from 'class-validator'
import { UserGenderType } from 'src/shared/Types/types'

export class UpdateUserDto {
    @IsEnum(UserGenderType)
    @IsOptional()
    @ApiProperty({
        required: false,
    })
    gender?: UserGenderType

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'updated@demo.com',
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
    @IsOptional()
    @ApiProperty({
        required: false,
    })
    full_name?: string

    @IsString()
    @IsOptional()
    @ApiProperty({
        required: false,
    })
    nick_name?: string

    @IsString()
    @IsOptional()
    @ApiProperty({
        required: false,
    })
    bio?: string

    @IsString()
    @IsOptional()
    @ApiProperty({
        required: false,
    })
    facebook?: string

    @IsString()
    @IsOptional()
    @ApiProperty({
        required: false,
    })
    twitter?: string

    @IsString()
    @IsOptional()
    @ApiProperty({
        required: false,
    })
    instagram?: string

    @IsString()
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

    @IsArray()
    @IsOptional()
    @ApiProperty({
        required: false,
    })
    interests?: [string]
}
