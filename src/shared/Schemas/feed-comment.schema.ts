import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNumber } from 'class-validator'
import { Document } from 'mongoose'
import { CommentLevelType, FeedType } from '../Types/types'

export type CommentDocument = Comment & Document

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    validateBeforeSave: true,
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
        enum: CommentLevelType,
    })
    level: CommentLevelType

    @ApiProperty()
    @IsNumber()
    @Prop({})
    reply_to?: string

    @ApiProperty()
    @Prop({})
    content?: string

    @ApiProperty()
    @IsNumber()
    @Prop({})
    number_of_reaction?: number

    @ApiProperty()
    @IsNumber()
    @Prop({})
    number_of_reply?: number
}

export const CommentSchema = SchemaFactory.createForClass(Comment)
