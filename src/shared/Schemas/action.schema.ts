import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type ActionDocument = Action & Document

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  validateBeforeSave: true,
})
export class Action {
  @Prop()
  name: string
}

export const InterestSchema = SchemaFactory.createForClass(Action)
