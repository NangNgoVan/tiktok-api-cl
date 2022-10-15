import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsObject, IsString } from 'class-validator'

export class CurrentFollowedUser {
    @ApiProperty()
    @IsBoolean()
    is_followed: boolean
}

export class CreatedUserDto {
    @ApiProperty()
    @IsString()
    _id: string
    @ApiProperty()
    @IsString()
    nick_name: string
    @ApiProperty()
    @IsString()
    full_name: string
    @ApiProperty()
    @IsString()
    avatar: string
    @ApiProperty()
    @IsObject()
    current_user: CurrentFollowedUser
}
