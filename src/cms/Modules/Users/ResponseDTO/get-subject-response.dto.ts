import { ApiProperty } from '@nestjs/swagger'

export class GetSubjectResponseDto {
    @ApiProperty({
        type: String,
    })
    _id: string

    @ApiProperty({
        type: String,
    })
    name: string
}
