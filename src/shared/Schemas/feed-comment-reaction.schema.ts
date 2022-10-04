import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { UserReactionType } from '../Types/types'

export type FeedCommentReactionDocument = FeedCommentReaction & Document

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    validateBeforeSave: true,
    collection: 'feed_comment_reactions',
})
export class FeedCommentReaction {
    @Prop()
    feed_id: string
    @Prop()
    comment_id: string
    @Prop()
    created_by: string
    @Prop()
    type: UserReactionType
}

export const FeedCommentReactionSchema =
    SchemaFactory.createForClass(FeedCommentReaction)
