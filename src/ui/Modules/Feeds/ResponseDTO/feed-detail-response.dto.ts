import { Prop } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNumber, IsObject, IsString } from 'class-validator'
import { FeedType } from 'src/shared/Types/types'
import { GetFeedResourceDto } from 'src/ui/Modules/Feeds/ResponseDTO/get-feed-resource.dto'
import { CreatedUserDto } from '../../../../shared/ResponseDTO/created-user.dto'
import { FeedCurrentUserResponseDto } from './feed-current-user-response.dto'

export class FeedDetailResponseDto {
    @ApiProperty()
    @IsString()
    id: string

    @Prop()
    @ApiProperty()
    @IsEnum({
        enum: FeedType,
    })
    type: FeedType

    @ApiProperty()
    @IsNumber()
    @Prop({
        default: 0,
    })
    number_of_view: number

    @ApiProperty()
    @IsNumber()
    @Prop({
        default: 0,
    })
    number_of_reaction: number

    @ApiProperty()
    @IsNumber()
    number_of_report: number

    @ApiProperty()
    @IsNumber()
    @Prop({
        default: 0,
    })
    number_of_bookmark: number

    @ApiProperty()
    @IsNumber()
    @Prop({
        default: 0,
    })
    number_of_comment: number

    @ApiProperty()
    @Prop({})
    created_by: string

    @ApiProperty()
    @Prop({})
    content: string

    @ApiProperty()
    @Prop()
    resource_ids: string[]

    @ApiProperty()
    @Prop()
    song_id?: string

    @ApiProperty()
    @Prop()
    hashtags: string[]

    @ApiProperty()
    @Prop({
        default: 0,
    })
    @ApiProperty()
    @IsObject()
    current_user: FeedCurrentUserResponseDto

    @ApiProperty()
    @IsObject()
    created_user: CreatedUserDto

    primary_image_index?: number

    @ApiProperty()
    @IsString()
    allowed_comment: boolean

    @ApiProperty({
        type: [GetFeedResourceDto],
    })
    resource_details: GetFeedResourceDto[]

    @ApiProperty()
    @IsString()
    created_at: string
}
