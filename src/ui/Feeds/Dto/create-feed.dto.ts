import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsEnum, IsString } from 'class-validator'
import { FeedType } from 'src/shared/Types/types'

export class CreateFeedDto {
    // @IsEnum({
    //     enum: FeedType
    // })
    // @ApiProperty({
    //     required: true,
    //     example: 'image'
    // })
    // type: FeedType

    @IsString()
    @ApiProperty()
    content: string

    // @IsArray()
    // @ApiProperty()
    // resources: string[]

    @IsString()
    @ApiProperty()
    song_id?: string

    @IsArray()
    @ApiProperty()
    hashtags?: string[]

    // @ApiProperty()
    @IsString()
    created_by?: string
}