import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { FeedType } from '../Types/types'

export type FeedResourceDocument = FeedResource & Document

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        /* deleted_at */
    },
    validateBeforeSave: true,
    collection: 'feed_resources',
})
export class FeedResource {
    @Prop()
    path: string
    @Prop()
    feed_id: string
    @Prop()
    type: FeedType
    @Prop()
    created_by: string
    @Prop()
    mimetype: string
}

export const FeedResourceSchema = SchemaFactory.createForClass(FeedResource)
