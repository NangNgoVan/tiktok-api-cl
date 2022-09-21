import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type FeedHashTagDocument = FeedHashTag & Document

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    validateBeforeSave: true,
})
export class FeedHashTag {
    @Prop()
    number_of_user: string
    @Prop()
    created_by: string
}

export const FeedHashTagSchema = SchemaFactory.createForClass(FeedHashTag)
