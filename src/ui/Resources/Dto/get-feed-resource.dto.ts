import { IsString } from 'class-validator'

export class GetFeedResourceDto {
    @IsString()
    resource_id: string
    @IsString()
    path: string
}
