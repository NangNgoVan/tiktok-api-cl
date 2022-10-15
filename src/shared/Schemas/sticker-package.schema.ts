import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'

export type StickerPackageDocument = StickerPackage & Document

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    validateBeforeSave: true,
    collection: 'sticker_packages',
})
export class StickerPackage {
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
    cover: string

    @Prop()
    @ApiProperty()
    description: string

    @Prop()
    @ApiProperty()
    created_by: string

    @Prop()
    deleted_at: number
}

export const StickerPackageSchema = SchemaFactory.createForClass(StickerPackage)
