import { ApiProperty } from '@nestjs/swagger'
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator'
import { max } from 'lodash'
import { FeedType } from 'src/shared/Types/types'
import { Transform } from 'class-transformer'

export class CreateFeedVideoDto {
    @IsString()
    @ApiProperty()
    @MaxLength(255)
    content: string

    @IsString()
    @IsOptional()
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
    @Transform(({ value }) => {
        if (value === 'true') return true
        if (value === 'false') return false
        return value
    })
    allowed_comment: boolean
}
