import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { UserGenderType as GenderType } from '../Types/types'
import { ApiProperty } from '@nestjs/swagger'

export type UserDocument = User & Document

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    validateBeforeSave: true,
})
export class User {
    //gender
    @Prop({
        enum: Object.values(GenderType).concat([null]),
        required: false,
        default: null,
        type: String,
        allowNull: true,
    })
    @ApiProperty()
    gender: GenderType

    //email
    @Prop({
        type: String,
        required: false,
        default: null,
        trim: true,
        lowercase: true,
    })
    @ApiProperty()
    email: string

    @Prop()
    @ApiProperty()
    facebook: string

    @Prop()
    @ApiProperty()
    twitter: string

    @Prop()
    @ApiProperty()
    instagram: string

    //number_of_follower
    @Prop({
        default: 0,
    })
    @ApiProperty()
    number_of_follower: number

    //number_of_following
    @Prop({
        default: 0,
    })
    @ApiProperty()
    number_of_following: number

    //number_of_post
    @Prop({
        default: 0,
    })
    @ApiProperty()
    number_of_post: number

    //birth_day
    @Prop({
        default: null,
    })
    @ApiProperty()
    birth_day: string

    //full_name
    @Prop({
        default: null,
    })
    @ApiProperty()
    full_name: string

    //nick_name
    @Prop()
    @ApiProperty()
    nick_name: string

    //bio
    @Prop()
    @ApiProperty()
    bio: string

    //address
    @Prop()
    @ApiProperty()
    address: string

    //avatar
    @Prop()
    @ApiProperty()
    avatar?: string

    //should_show_tour_guild
    @Prop({
        default: true,
    })
    @ApiProperty()
    should_show_tour_guild: boolean

    //should_show_account_setup_flow
    @Prop({
        default: true,
    })
    @ApiProperty()
    should_show_account_setup_flow: boolean

    //interest
    @Prop({
        default: [],
    })
    @ApiProperty()
    roles: [string]

    //interest
    @Prop({
        default: [],
    })
    @ApiProperty()
    interests: [string]

    @Prop({
        default: null,
    })
    @ApiProperty()
    blocked_at?: string

    @Prop()
    @ApiProperty()
    deleted_at: string
}

export const UserSchema = SchemaFactory.createForClass(User)
