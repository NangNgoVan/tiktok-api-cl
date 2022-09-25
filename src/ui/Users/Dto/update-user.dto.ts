import { ApiProperty } from '@nestjs/swagger'
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    Matches,
} from 'class-validator'
import { UserGenderType } from 'src/shared/Types/types'

export class UpdateUserDto {
    @IsEnum(UserGenderType)
    @IsOptional()
    @ApiProperty()
    gender?: UserGenderType

    @IsString()
    @IsOptional()
    @ApiProperty({
        example: 'updated@demo.com',
    })
    @Matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, {
        message: 'Email must be a type of email',
    })
    email?: string

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        default: 0,
    })
    number_of_follower?: number

    @IsString({})
    @IsOptional()
    @ApiProperty()
    birth_day?: string

    @IsString()
    @IsOptional()
    @ApiProperty()
    full_name?: string

    @IsString()
    @IsOptional()
    @ApiProperty()
    nick_name?: string

    @IsString()
    @IsOptional()
    @ApiProperty()
    address?: string

    @IsBoolean()
    @IsOptional()
    @ApiProperty()
    should_show_account_setup_flow?: boolean

    @IsBoolean()
    @IsOptional()
    @ApiProperty()
    should_show_tour_guild?: boolean

    @IsArray()
    @IsOptional()
    @ApiProperty()
    interests?: [string]
}
