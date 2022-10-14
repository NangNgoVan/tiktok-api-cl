import { ApiProperty } from '@nestjs/swagger'
import {
    IsBoolean,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator'

export class CreateFeedImageDto {
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
    primary_image_index: number

    @IsBoolean()
    @ApiProperty()
    allowed_comment: boolean
}
