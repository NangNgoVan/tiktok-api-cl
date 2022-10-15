import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class GetFeedResourceDto {
    @IsString()
    @ApiProperty()
    _id: string
    @IsString()
    @ApiProperty()
    path: string
    @ApiProperty()
    @IsString()
    mimetype: string
}
