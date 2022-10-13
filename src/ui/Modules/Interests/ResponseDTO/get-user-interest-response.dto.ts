import { ApiProperty } from '@nestjs/swagger'

export class GetUserInterestResponseDto {
    @ApiProperty({
        type: String,
    })
    _id: string

    @ApiProperty({
        type: String,
    })
    user_id: string

    @ApiProperty({
        type: String,
    })
    interest_id: string

    @ApiProperty({
        type: String,
    })
    interest_name: string
}
