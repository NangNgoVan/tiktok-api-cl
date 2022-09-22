import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString } from 'class-validator'
import { Document } from 'mongoose'

export type InterestDocument = Interest & Document

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    validateBeforeSave: true,
})
export class Interest {
    @Prop()
    @ApiProperty()
    @IsString()
    name: string

    @Prop()
    @ApiProperty()
    @IsNumber()
    display_order: number
}

export const InterestSchema = SchemaFactory.createForClass(Interest)
