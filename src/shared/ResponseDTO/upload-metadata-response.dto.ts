import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString } from 'class-validator'

export class UploadMetaDataResponseDto {
    @IsString()
    @ApiProperty()
    url: string

    @IsNumber()
    @ApiProperty()
    size: number
}
