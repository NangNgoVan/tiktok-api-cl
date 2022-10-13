import { ApiProperty } from '@nestjs/swagger'

export class GetSongResponseDto {
    @ApiProperty()
    id: string
    @ApiProperty()
    thumbnail: string
    @ApiProperty()
    display_order: number
    @ApiProperty()
    number_of_use: number
    @ApiProperty()
    number_of_bookmark: number
    @ApiProperty()
    duration_in_second: number
    @ApiProperty()
    name: string
    @ApiProperty()
    artist: string
    @ApiProperty()
    path: string
    @ApiProperty()
    deleted_at: string
    @ApiProperty()
    created_by: string
}
