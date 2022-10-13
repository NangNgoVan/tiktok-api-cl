import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import paginateV2 from 'mongoose-paginate-v2'

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

    @Prop()
    thumbnail: string

    @Prop({
        default: 0,
    })
    number_of_use: number

    @Prop({
        default: 0,
    })
    number_of_bookmark: number

    @Prop({
        default: 0,
    })
    duration_in_second: number

    @Prop()
    artist: string

    @Prop({
        maxlength: 255,
    })
    name: string

    @Prop()
    path: string

    @Prop()
    deleted_at: string

    @Prop()
    created_by: string
}

export const SongSchema = SchemaFactory.createForClass(Song)
SongSchema.plugin(paginateV2)
