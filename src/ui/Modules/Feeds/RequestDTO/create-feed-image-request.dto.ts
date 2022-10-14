import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
    IsBoolean,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator'
import _ from 'lodash'

export class CreateFeedImageRequestDto {
    @IsString()
    @IsOptional()
    @MaxLength(100)
    @ApiProperty()
    content?: string

    // @IsString()
    // @IsOptional()
    // @ApiProperty()
    // song_id?: string

    hashtags?: string[]

    created_by?: string

    @IsNumber()
    @ApiProperty()
    @Transform(({ value }) => {
        return _.parseInt(value, 10)
    })
    primary_image_index: number

    @IsBoolean()
    @ApiProperty()
    @Transform(({ value }) => {
        if (value === 'true') return true
        if (value === 'false') return false
        return value
    })
    allowed_comment: boolean
}
