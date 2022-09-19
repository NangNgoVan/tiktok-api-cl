import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type SubjectDocument = Subject & Document

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  validateBeforeSave: true,
})
export class Subject {
  @Prop()
  name: string
}

export const SubjectSchema = SchemaFactory.createForClass(Subject)
