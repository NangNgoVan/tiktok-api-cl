import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type AuthMethodDocument = AuthMethod & Document

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  validateBeforeSave: true,
})
export class AuthMethod {
  @Prop()
  name: string
}

export const AuthMethodSchema = SchemaFactory.createForClass(AuthMethod)
