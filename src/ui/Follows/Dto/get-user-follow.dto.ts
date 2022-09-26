import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString } from 'class-validator'

export class GetUserFollowDto {
    @ApiProperty()
    @IsString()
    user_id: string
    @ApiProperty()
    @IsString()
    full_name: string
    @ApiProperty()
    @IsString()
    nick_name: string
    @ApiProperty()
    @IsString()
    avatar_url: string
    // @ApiProperty()
    // @IsNumber()
    // number_of_follower?: number
    // @ApiProperty()
    // @IsNumber()
    // number_of_following?: number
}
