import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { UserGenderType as GenderType } from '../Types/types'

export type UserDocument = User & Document

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    validateBeforeSave: true,
})
export class User {
    //web3token
    @Prop({ default: null })
    token: string

    //gender
    @Prop({
        enum: Object.values(GenderType).concat([null]),
        required: false,
        default: null,
        type: String,
        allowNull: true,
    })
    gender: GenderType

    //email
    @Prop({
        type: String,
        required: false,
        default: null,
        trim: true,
        lowercase: true,
    })
    email: string
    //number_of_follower
    @Prop({
        default: 0,
    })
    number_of_follower: number
    //birth_day
    @Prop({
        default: null,
    })
    birth_day: string
    //full_name
    @Prop({
        default: null,
    })
    full_name: string
    //nick_name
    @Prop()
    nick_name: string
    //adress
    @Prop()
    address: string
    //avatar_url
    @Prop()
    avatar_url: string
    //should_show_tour_guild
    @Prop({
        default: true,
    })
    should_show_account_setup_flow: boolean
    //should_show_account_setup_flow
    @Prop({
        default: true,
    })
    roles: boolean
    //interest
    @Prop({
        default: [],
    })
    interests: [string]
    @Prop({
        default: null,
    })
    blocked_at?: string

    @Prop()
    deleted_at: string
}

export const UserSchema = SchemaFactory.createForClass(User)
