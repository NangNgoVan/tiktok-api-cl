import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type RoleDocument = Role & Document

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  validateBeforeSave: true,
})
export class Role {
  @Prop()
  name: string
  @Prop()
  permissions: string[]
}

export const RoleSchema = SchemaFactory.createForClass(Role)
