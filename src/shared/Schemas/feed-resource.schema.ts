import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { FeedType, UserReactionType } from '../Types/types'

export type FeedResourceDocument = FeedResource & Document

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        /* deleted_at */
    },
    validateBeforeSave: true,
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
    updated_by: string
}

export const FeedResourceSchema = SchemaFactory.createForClass(FeedResource)
