import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type SongBookmarkDocument = SongBookmark & Document

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    validateBeforeSave: true,
})
export class SongBookmark {
    @Prop()
    song_id: string
    @Prop()
    created_by: string[]
}

export const SongBookmarkSchema = SchemaFactory.createForClass(SongBookmark)
