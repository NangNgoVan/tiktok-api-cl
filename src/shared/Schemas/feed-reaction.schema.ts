import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { UserReactionType } from '../Types/types'

export type FeedReactionDocument = FeedReaction & Document

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        /* deleted_at */
    },
    validateBeforeSave: true,
})
export class FeedReaction {
    @Prop()
    feedId: string
    @Prop()
    created_by: string
    @Prop()
    type: UserReactionType
}

export const FeedReactionSchema = SchemaFactory.createForClass(FeedReaction)
