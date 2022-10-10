import { ApiProperty } from '@nestjs/swagger'
import { UserGenderType as GenderType } from '../../../../shared/Types/types'

export class GetUserResponseDto {
    @ApiProperty()
    gender: GenderType

    @ApiProperty()
    email: string

    @ApiProperty()
    facebook: string

    @ApiProperty()
    twitter: string

    @ApiProperty()
    instagram: string

    @ApiProperty()
    number_of_follower: number

    @ApiProperty()
    number_of_following: number

    @ApiProperty()
    number_of_feed: number

    @ApiProperty()
    birth_day: string

    @ApiProperty()
    full_name: string

    @ApiProperty()
    nick_name: string

    @ApiProperty()
    bio: string

    @ApiProperty()
    address: string

    @ApiProperty()
    avatar?: string

    @ApiProperty()
    should_show_tour_guild: boolean

    @ApiProperty({
        default: true,
        type: Boolean,
    })
    is_trial_user: boolean

    @ApiProperty()
    should_show_account_setup_flow: boolean

    @ApiProperty({
        type: String,
        isArray: true,
    })
    roles: string[]

    @ApiProperty({
        type: String,
        isArray: true,
    })
    interests: string[]

    @ApiProperty({
        type: String,
        isArray: true,
    })
    @ApiProperty()
    permissions: string[]

    @ApiProperty()
    blocked_at?: string

    @ApiProperty({
        default: null,
        type: Date,
    })
    deleted_at?: string
}
