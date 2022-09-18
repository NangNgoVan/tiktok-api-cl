import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FeedDocument = Feed & Document;

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
    type: string
    @Prop()
    numberOfReaction: number
    @Prop()
    numberOfBookmark: number
    @Prop()
    createdBy: string
    @Prop()
    content: string
    @Prop()
    url: string[]
}

export const FeedSchema = SchemaFactory.createForClass(Feed)