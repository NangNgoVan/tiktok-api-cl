import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type FeedDocument = Feed & Document

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        /* deleted_at */
    },
    validateBeforeSave: true,
})
export class Feed {
    @Prop()
    type: string
    @Prop({
        default: 0,
    })
    number_of_view: number
    @Prop({
        default: 0,
    })
    number_of_reaction: number
    @Prop({
        default: 0,
    })
    number_of_bookmark: number
    @Prop({})
    created_by: string
    @Prop({})
    content: string
    @Prop()
    resource_id: string[]
    @Prop()
    song_id?: string
    @Prop()
    hashtags: string[]
}

export const FeedSchema = SchemaFactory.createForClass(Feed)
