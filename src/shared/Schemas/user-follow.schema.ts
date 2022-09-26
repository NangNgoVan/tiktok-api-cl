import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type UserFollowDocument = UserFollow & Document

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    validateBeforeSave: true,
    collection: 'user_follows',
})
export class UserFollow {
    @Prop()
    user_id: string

    @Prop()
    created_by: string
}

export const UserFollowSchema = SchemaFactory.createForClass(UserFollow)
