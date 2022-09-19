import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { UserAuthMethodType } from '../Types/types'

export type UserAuthMethodDocument = UserAuthMethod & Document

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  validateBeforeSave: true,
})
export class UserAuthMethod {
  @Prop()
  userId: string
  @Prop()
  authenticationMethod: UserAuthMethodType
  @Prop()
  data: object
}

export const UserAuthMethodSchema = SchemaFactory.createForClass(UserAuthMethod)
