import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type FeedBookmarkDocument = FeedBookmark & Document

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    validateBeforeSave: true,
    collection: 'feed_bookmarks',
})
export class FeedBookmark {
    @Prop()
    feed_id: string
    @Prop()
    created_by: string
}

export const FeedBookmarkSchema = SchemaFactory.createForClass(FeedBookmark)
