import { ApiProperty } from '@nestjs/swagger'
import { UserGenderType as GenderType } from '../../../../shared/Types/types'

export class GetRoleResponseDto {
    @ApiProperty({
        type: String
    })
    name: string


    @ApiProperty({
        type: String,
        isArray: true
    })
    permissions: string[]
}
