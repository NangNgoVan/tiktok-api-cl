import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { plainToInstance } from 'class-transformer'
import { Document } from 'mongoose'

export type HashTagDocument = HashTag & Document

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    validateBeforeSave: true,
})
export class HashTag {
    @Prop({
        default: 1,
    })
    number_of_use: number
    @Prop()
    created_by: string
    @Prop({
        unique: true,
    })
    tag: string
}

export const HashTagSchema = SchemaFactory.createForClass(HashTag)
