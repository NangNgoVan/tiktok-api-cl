import { IsNumber, IsString } from 'class-validator'

export class GetInterestsDto {
    @IsString()
    name: string

    @IsNumber()
    display_order: number
}
