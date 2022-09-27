import { ApiProperty } from '@nestjs/swagger'
import { String } from 'aws-sdk/clients/acm'
import { IsArray, IsBoolean, IsString } from 'class-validator'
import { GetUserFollowDto } from './get-user-follow.dto'

export class PaginateUserFollowsDto {
    @ApiProperty({
        type: [GetUserFollowDto],
    })
    results
    @ApiProperty()
    @IsString()
    previous: string
    @ApiProperty()
    @IsBoolean()
    hasPrevious: boolean
    @ApiProperty()
    @IsString()
    next: string
    @ApiProperty()
    @IsBoolean()
    hasNext: boolean
}
