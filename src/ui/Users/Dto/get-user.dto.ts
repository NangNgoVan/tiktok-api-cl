import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString, Matches } from 'class-validator'
import { UserGenderType } from 'src/shared/Types/types'

export class GetUserDto {
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
    @ApiProperty()
    number_of_follower: number
    number_of_following: number
    birth_day: string
    full_name: string
    nick_name: string
    address: string
    should_show_account_setup_flow: boolean
    roles: boolean
    interests: [string]
    blocked_at?: string
}
