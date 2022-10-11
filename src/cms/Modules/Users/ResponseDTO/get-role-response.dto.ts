import { ApiProperty } from '@nestjs/swagger'

export class GetRoleResponseDto {
    @ApiProperty({
        type: String,
    })
    _id: string

    @ApiProperty({
        type: String,
    })
    name: string

    @ApiProperty({
        type: String,
        isArray: true,
    })
    permissions: string[]
}
