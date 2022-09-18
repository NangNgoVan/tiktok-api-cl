import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ReactionType } from '../Types/types';

export type FeedCommentReactionDocument = FeedCommentReaction & Document;

@Schema({
    timestamps: { 
        createdAt: 'created_at', 
        updatedAt: 'updated_at' 
    },
    validateBeforeSave: true,
})
export class FeedCommentReaction {
    @Prop()
    feedId: string
    @Prop()
    commentId: string
    @Prop()
    createdBy: string
    @Prop()
    type: ReactionType
}

export const FeedCommentReactionSchema = SchemaFactory.createForClass(FeedCommentReaction)