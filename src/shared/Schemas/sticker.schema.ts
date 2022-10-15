import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'

export type StickerDocument = Sticker & Document

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    validateBeforeSave: true,
})
export class Sticker {
    @Prop()
    @ApiProperty()
    category_id: string

    @Prop()
    @ApiProperty()
    package_id: string

    @Prop({
        maxlength: 50,
    })
    @ApiProperty()
    name: string

    @Prop()
    @ApiProperty()
    emoji: string

    @Prop({
        default: 999,
    })
    @ApiProperty()
    display_order: number

    @Prop()
    @ApiProperty()
    path: string

    @Prop()
    @ApiProperty()
    created_by: string
}

export const StickerSchema = SchemaFactory.createForClass(Sticker)
