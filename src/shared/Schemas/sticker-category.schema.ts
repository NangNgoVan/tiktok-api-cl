import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'

export type StickerCategoryDocument = StickerCategory & Document

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    validateBeforeSave: true,
})
export class StickerCategory {
    @Prop()
    @ApiProperty()
    name: string

    @Prop({
        default: 999,
    })
    @ApiProperty()
    display_order: number

    @Prop()
    @ApiProperty()
    thumbnail: string

    @Prop()
    @ApiProperty()
    created_by: string
}

export const StickerCategorySchema =
    SchemaFactory.createForClass(StickerCategory)
