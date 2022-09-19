import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type FeedCommentDocument = FeedComment & Document

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  validateBeforeSave: true,
})
export class FeedComment {
  @Prop()
  feedId: string
  @Prop()
  createdBy: string
  @Prop()
  level: number
  @Prop()
  content: string
  @Prop()
  numberOfReaction: number
  @Prop()
  numberOfReply: number
}

export const FeedCommentSchema = SchemaFactory.createForClass(FeedComment)
