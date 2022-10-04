import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNumber } from 'class-validator'
import { Document } from 'mongoose'
import { FeedCommentLevel, FeedType } from '../Types/types'

export type FeedCommentDocument = Comment & Document

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    validateBeforeSave: true,
    collection: 'feed_comments',
})
export class FeedComment {
    @ApiProperty()
    @Prop({})
    feed_id: string

    @ApiProperty()
    @Prop({})
    created_by: string

    @Prop()
    @ApiProperty()
    @IsEnum({
        enum: FeedCommentLevel,
    })
    level: FeedCommentLevel

    @ApiProperty()
    @IsNumber()
    @Prop({})
    reply_to?: string

    @ApiProperty()
    @Prop({})
    content: string

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
    number_of_reply: number
}

export const FeedCommentSchema = SchemaFactory.createForClass(FeedComment)
