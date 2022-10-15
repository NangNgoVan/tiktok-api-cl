import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
    ArrayMaxSize,
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator'

export class CreateFeedVideoRequestDto {
    // We are not using this field in this dto. it's just for swagger
    @ApiProperty({
        type: String,
        format: 'binary',
        required: true,
    })
    resources: never

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
        maxItems: 15,
        items: {
            maxLength: 50,
        },
    })
    hashtags?: string[]

    @IsBoolean()
    @ApiProperty()
    @Transform(({ value }) => {
        if (value === 'true') return true
        if (value === 'false') return false
        return value
    })
    allowed_comment: boolean
}
