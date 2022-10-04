import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Document } from 'mongoose'

import { UserReactionType } from '../Types/types'

export type FeedReactionDocument = FeedReaction & Document

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    validateBeforeSave: true,
    collection: 'feed_reactions',
})
export class FeedReaction {
    @Prop()
    @ApiProperty()
    feed_id: string

    @Prop()
    @ApiProperty()
    created_by: string

    @Prop()
    @ApiProperty()
    type: UserReactionType
}

export const FeedReactionSchema = SchemaFactory.createForClass(FeedReaction)
