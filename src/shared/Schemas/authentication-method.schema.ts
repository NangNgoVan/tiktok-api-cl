import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type AuthMethodDocument = AuthenticationMethod & Document

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    validateBeforeSave: true,
})
export class AuthenticationMethod {
    @Prop({
        unique: true,
    })
    name: string
}

export const AuthMethodSchema =
    SchemaFactory.createForClass(AuthenticationMethod)
