import { ApiProperty } from '@nestjs/swagger'

export class GetActionResponseDto {
    @ApiProperty({
        type: String,
    })
    _id: string

    @ApiProperty({
        type: String,
    })
    name: string
}
