import { ApiProperty } from '@nestjs/swagger'

export class CreateOrUpdateUserInterestResponseDto {
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
}
