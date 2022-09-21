import { ApiProperty } from '@nestjs/swagger'
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsNumber,
    IsString,
    Matches,
} from 'class-validator'
import { UserGenderType } from 'src/shared/Types/types'

export class UpdateUserDto {
    @IsEnum(UserGenderType)
    @ApiProperty()
    gender: UserGenderType
    @IsString()
    @ApiProperty({
        required: true,
        example: 'updated@demo.com',
    })
    @Matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, {
        message: 'Email must be a type of email',
    })
    email: string
    @IsNumber()
    @ApiProperty({
        default: 0,
    })
    number_of_follower: number
    @IsString({})
    @ApiProperty()
    birth_day: string
    @IsString()
    @ApiProperty()
    full_name: string
    @IsString()
    @ApiProperty()
    nick_name: string
    @IsString()
    @ApiProperty()
    address: string
    @IsBoolean()
    @ApiProperty()
    should_show_account_setup_flow: boolean
    @IsBoolean()
    @ApiProperty()
    roles: boolean
    @IsArray()
    @ApiProperty()
    interests: [string]
    blocked_at?: string
}
