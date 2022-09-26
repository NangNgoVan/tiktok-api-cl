import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { type } from 'os'

export type UserAuthenticationMethodDocument = UserAuthenticationMethod &
    Document

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    validateBeforeSave: true,
})
export class UserAuthenticationMethod {
    @Prop()
    user_id: string

    @Prop()
    authentication_method: string

    @Prop()
    data:
        | {
              address: string
          }
        | {
              username: string
              password: string
          }
}

export const UserAuthenticationMethodSchema = SchemaFactory.createForClass(
    UserAuthenticationMethod,
)
