import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { ApiProperty } from '@nestjs/swagger'

export type UserInterestDocument = UserInterest & Document

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    validateBeforeSave: true,
    collection: 'user_interests',
})
export class UserInterest {
    @ApiProperty()
    @Prop()
    user_id: string

    @ApiProperty()
    @Prop()
    interest_id: string
}

const UserInterestSchema = SchemaFactory.createForClass(UserInterest)

UserInterestSchema.index({ user_id: 1, interest_id: 1 }, { unique: true })

export { UserInterestSchema }
