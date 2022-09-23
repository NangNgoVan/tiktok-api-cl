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
    resource_id: string[]

    @ApiProperty()
    @Prop()
    song_id?: string

    @ApiProperty()
    @Prop()
    hashtags: string[]
}

export const FeedSchema = SchemaFactory.createForClass(Feed)
