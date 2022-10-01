import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString } from 'class-validator'
import { CurrentFollowedUser } from 'src/shared/Dto/created-user.dto'

export class GetUserFollowDto {
    @ApiProperty()
    @IsString()
    _id: string
    @ApiProperty()
    @IsString()
    full_name: string
    @ApiProperty()
    @IsString()
    nick_name: string
    @ApiProperty()
    @IsString()
    avatar?: string
    @ApiProperty({
        type: CurrentFollowedUser,
    })
    current_user: CurrentFollowedUser
    // @ApiProperty()
    // @IsNumber()
    // number_of_follower?: number
    // @ApiProperty()
    // @IsNumber()
    // number_of_following?: number
}
