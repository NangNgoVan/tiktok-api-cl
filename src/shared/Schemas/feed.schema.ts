import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsEnum, IsNumber } from 'class-validator'
import { Document } from 'mongoose'
import { FeedType } from '../Types/types'

export type FeedDocument = Feed & Document

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        /* deleted_at */
    },
    validateBeforeSave: true,
})
export class Feed {
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
    @IsNumber()
    @Prop({
        default: 0,
    })
    number_of_comment: number

    @ApiProperty()
    @IsNumber()
    @Prop({
        default: 0,
    })
    number_of_report: number

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
    primary_image_index?: number

    @ApiProperty()
    @Prop({
        default: true,
    })
    allow_comment: boolean
}

export const FeedSchema = SchemaFactory.createForClass(Feed)
