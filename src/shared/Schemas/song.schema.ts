import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { IsNumber, IsString } from 'class-validator'
import { Document } from 'mongoose'

export type SongDocument = Song & Document

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    validateBeforeSave: true,
})
export class Song {
    @Prop({
        default: 999,
    })
    display_order: number

    @Prop({
        default: 0,
    })
    number_of_use: number

    @Prop({
        maxlength: 255,
    })
    name: string

    @Prop()
    path: string

    @Prop()
    deleted_at: number

    @Prop()
    created_by: string
}

export const SongSchema = SchemaFactory.createForClass(Song)
