import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsObject, IsString } from 'class-validator'

class CurrentUserFollowFeedAuthor {
    @ApiProperty()
    @IsBoolean()
    is_followed: boolean
}

export class FeedAuthorDto {
    @ApiProperty()
    @IsString()
    id: string
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
    current_user: CurrentUserFollowFeedAuthor
}
