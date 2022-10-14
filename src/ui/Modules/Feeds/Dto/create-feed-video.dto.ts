import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateFeedVideoDto {
    @IsString()
    @IsOptional()
    @ApiProperty()
    @MaxLength(100)
    content?: string

    // @IsString()
    // @IsOptional()
    // @ApiProperty()
    // song_id?: string

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
