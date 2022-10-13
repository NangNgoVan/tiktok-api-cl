import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsString } from 'class-validator'

export class CreateOrUpdateUserInterestRequestDto {
    @IsArray()
    @IsString({ each: true })
    @ApiProperty({
        type: String,
        isArray: true,
        description: 'List of Interest Id',
    })
    interest_ids: string[]
}
