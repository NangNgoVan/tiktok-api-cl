import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InterestDocument = Interest & Document;

@Schema({
    timestamps: { 
        createdAt: 'created_at', 
        updatedAt: 'updated_at' 
    },
    validateBeforeSave: true,
})
export class Interest {
    @Prop()
    name: string

    @Prop()
    dispalyOrder: number
}

export const InterestSchema = SchemaFactory.createForClass(Interest)
