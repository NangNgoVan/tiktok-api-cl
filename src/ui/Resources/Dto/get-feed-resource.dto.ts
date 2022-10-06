import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class GetFeedResourceDto {
    @IsString()
    @ApiProperty()
    resource_id: string
    @IsString()
    @ApiProperty()
    path: string
    @ApiProperty()
    @IsString()
    mime: string
}
