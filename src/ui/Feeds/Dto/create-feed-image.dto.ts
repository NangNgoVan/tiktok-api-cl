import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNumber, IsString, MaxLength } from 'class-validator'

export class CreateFeedImageDto {
    @IsString()
    @ApiProperty()
    @MaxLength(255)
    content: string

    @IsString()
    @ApiProperty()
    song_id?: string

    hashtags?: string[]

    created_by?: string
    @IsNumber()
    @ApiProperty()
    primary_image_index?: number

    @IsBoolean()
    @ApiProperty()
    allowed_comment: boolean
}
