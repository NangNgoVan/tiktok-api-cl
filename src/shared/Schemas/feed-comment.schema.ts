import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type FeedCommentDocument = FeedComment & Document

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    validateBeforeSave: true,
})
export class FeedComment {
    @Prop()
    feed_id: string
    @Prop()
    created_by: string
    @Prop()
    level: number
    @Prop()
    content: string
    @Prop()
    number_of_reaction: number
    @Prop()
    number_of_reply: number
}

export const FeedCommentSchema = SchemaFactory.createForClass(FeedComment)
