import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsNumber, IsString } from 'class-validator'
import _ from 'lodash'

export class CreateStickerPackageResquestDto {
    @ApiProperty()
    @IsString()
    name: string

    @ApiProperty()
    @IsNumber()
    @Transform(({ value }) => {
        return _.parseInt(value, 10)
    })
    display_order: number

    @ApiProperty()
    @IsString()
    description: string
}
