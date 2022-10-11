import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class CreateSongDto {
    @ApiProperty()
    @IsString()
    name: string

    @ApiProperty()
    @IsString()
    artist: string
}
