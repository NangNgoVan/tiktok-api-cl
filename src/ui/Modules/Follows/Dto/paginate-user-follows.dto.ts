import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsString } from 'class-validator'
import { GetUserFollowDto } from './get-user-follow.dto'

export class PaginateUserFollowsDto {
    constructor() {
        this.results = []
        this.previous = ''
        this.hasPrevious = false
        this.hasNext = false
        this.next = ''
    }
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
    next?: string
    @ApiProperty()
    @IsBoolean()
    hasNext: boolean
}
