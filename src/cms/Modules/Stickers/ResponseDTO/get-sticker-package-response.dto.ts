import { ApiProperty } from '@nestjs/swagger'

export class GetStickerPackageResponseDto {
    @ApiProperty()
    _id: string

    @ApiProperty()
    name: string

    @ApiProperty()
    display_order: number

    @ApiProperty()
    description: string

    @ApiProperty()
    created_by: string

    @ApiProperty()
    thumbnail: string
}
