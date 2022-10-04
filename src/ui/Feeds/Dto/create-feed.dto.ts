import { ApiProperty } from '@nestjs/swagger'
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsNumber,
    IsString,
    MaxLength,
} from 'class-validator'
import { max } from 'lodash'
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
    @MaxLength(255)
    content: string

    // @IsArray()
    // @ApiProperty()
    // resources: string[]

    @IsString()
    @ApiProperty()
    song_id?: string

    // @IsArray()
    // @ApiProperty()
    hashtags?: string[]

    // @ApiProperty()
    // @IsString()
    created_by?: string
    @IsNumber()
    @ApiProperty()
    primary_image_index?: number

    @IsBoolean()
    @ApiProperty()
    allowed_comment: boolean
}
