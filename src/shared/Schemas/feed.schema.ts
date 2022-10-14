import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNumber } from 'class-validator'
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
    @Prop({
        enum: FeedType,
    })
    type: FeedType

    @Prop({
        default: 0,
        type: Number,
        min: 0,
    })
    number_of_view?: number

    @Prop({
        default: 0,
        type: Number,
        min: 0,
    })
    number_of_reaction?: number

    @Prop({
        default: 0,
        type: Number,
        min: 0,
    })
    number_of_bookmark?: number

    @Prop({
        default: 0,
        type: Number,
        min: 0,
    })
    number_of_comment?: number

    @Prop({
        default: 0,
        type: Number,
        min: 0,
    })
    number_of_report?: number

    @Prop({
        required: true,
        type: String,
    })
    created_by: string

    @ApiProperty()
    @Prop({
        maxlength: 255,
        required: false,
    })
    content?: string

    // @ApiProperty()
    // @Prop()
    // resource_ids: string[]

    @Prop({
        required: false,
        type: String,
    })
    song_id?: string

    @Prop({
        type: [String],
        default: [],
    })
    hashtags: string[]

    @Prop({
        default: 0,
    })
    primary_image_index?: number

    @Prop({
        default: true,
    })
    allowed_comment: boolean
}

export const FeedSchema = SchemaFactory.createForClass(Feed)
