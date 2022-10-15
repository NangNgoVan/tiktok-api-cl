import { ApiProperty } from '@nestjs/swagger'

export class GetInterestResponseDto {
    @ApiProperty({
        type: String,
    })
    _id: string

    @ApiProperty({
        type: String,
    })
    name: string

    @ApiProperty({
        type: Number,
    })
    display_order: number
}
