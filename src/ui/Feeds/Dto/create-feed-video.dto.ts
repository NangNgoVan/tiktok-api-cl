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

export class CreateFeedVideoDto {
    @IsString()
    @ApiProperty()
    @MaxLength(255)
    content: string

    @IsString()
    @ApiProperty()
    song_id?: string

    // @IsArray()
    // @ApiProperty()
    hashtags?: string[]

    // @ApiProperty()
    // @IsString()
    created_by?: string

    @IsBoolean()
    @ApiProperty()
    allowed_comment: boolean
}
