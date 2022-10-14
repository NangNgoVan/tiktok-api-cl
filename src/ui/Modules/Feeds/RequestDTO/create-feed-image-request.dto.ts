import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
    ArrayMaxSize,
    IsArray,
    IsBoolean,
    IsNotEmpty,
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
    @ApiProperty({
        type: String,
        required: false,
        maxLength: 100,
    })
    content?: string

    @IsString()
    @IsOptional()
    @ApiProperty({
        type: String,
        required: false,
    })
    song_id?: string

    @IsArray()
    @ArrayMaxSize(15)
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    @IsOptional()
    @ApiProperty({
        type: String,
        isArray: true,
        required: false,
    })
    hashtags?: string[]

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
