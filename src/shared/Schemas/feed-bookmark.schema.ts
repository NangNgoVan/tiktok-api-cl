import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FeedBookmarkDocument = FeedBookmark & Document;

@Schema({
    timestamps: { 
        createdAt: 'created_at', 
        updatedAt: 'updated_at' 
    },
    validateBeforeSave: true,
})
export class FeedBookmark {
    @Prop()
    feedId: string
    @Prop()
    createdBy: string
}

export const FeedBookmarkSchema = SchemaFactory.createForClass(FeedBookmark)
