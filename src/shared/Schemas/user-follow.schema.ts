import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type UserFollowDocument = UserFollow & Document

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    validateBeforeSave: true,
})
export class UserFollow {
    @Prop()
    userId: string
    @Prop()
    createdBy: string
}

export const UserFollowSchema = SchemaFactory.createForClass(UserFollow)
