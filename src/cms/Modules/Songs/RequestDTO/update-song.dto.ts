import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString } from 'class-validator'

export class UpdateSongDto {
    @ApiProperty()
    @IsString()
    name?: string

    @ApiProperty()
    @IsString()
    artist?: string

    @ApiProperty()
    @IsString()
    path?: string

    @ApiProperty()
    @IsString()
    thumbnail?: string

    @ApiProperty()
    @IsNumber()
    duration_in_second: number
}
