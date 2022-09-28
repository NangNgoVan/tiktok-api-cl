import { Prop } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsEnum, IsNumber, IsObject } from 'class-validator'
import { Feed } from 'src/shared/Schemas/feed.schema'
import { FeedType } from 'src/shared/Types/types'
import { GetFeedResourceDto } from 'src/ui/Resources/Dto/get-feed-resource.dto'
import { CreatedUserDto } from '../../../shared/Dto/created-user.dto'
import { FeedCurrentUserDto } from './feed-current-user.dto'

export class FeedDetailDto {
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
    @Prop({
        default: 0,
    })
    number_of_bookmark: number

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
    current_user: FeedCurrentUserDto

    @ApiProperty()
    @IsObject()
    created_user: CreatedUserDto

    primary_image_index?: number
}
