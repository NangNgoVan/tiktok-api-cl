import { ApiProperty } from '@nestjs/swagger'
import {
    IsArray,
    IsBoolean,
    IsEmail,
    IsNumber,
    IsString,
} from 'class-validator'
import { CurrentFollowedUser } from 'src/shared/ResponseDTO/created-user.dto'
import { UserGenderType } from 'src/shared/Types/types'

export class GetUserResponseDto {
    @ApiProperty()
    @IsString()
    _id: string

    @ApiProperty({
        enum: UserGenderType,
        example: UserGenderType.FEMALE,
    })
    gender: UserGenderType

    @IsString()
    @ApiProperty({
        required: true,
        example: 'updated@demo.com',
    })
    @IsEmail()
    email?: string

    @ApiProperty()
    @IsNumber()
    number_of_feed?: number

    @IsNumber()
    @ApiProperty()
    number_of_follower?: number

    @IsString()
    @ApiProperty()
    number_of_following?: number

    @IsString()
    @ApiProperty()
    birth_day?: string

    @IsString()
    @ApiProperty()
    full_name?: string

    @IsString()
    @ApiProperty()
    nick_name?: string

    @IsString()
    @ApiProperty()
    address?: string

    @IsBoolean()
    @ApiProperty()
    should_show_account_setup_flow?: boolean

    @IsBoolean()
    @ApiProperty()
    roles: string[]

    @ApiProperty()
    @IsString()
    blocked_at?: string

    @ApiProperty()
    @IsString()
    created_at?: string

    @ApiProperty()
    @IsString()
    updated_at?: string

    @ApiProperty({
        type: CurrentFollowedUser,
    })
    current_user?: CurrentFollowedUser

    @ApiProperty()
    @IsString()
    avatar?: string
}
