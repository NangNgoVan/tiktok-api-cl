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
    numberOfFollowers: number
    //birth_day
    @Prop({})
    birthDay: string
    //full_name
    @Prop({})
    fullName: string
    //nick_name
    @Prop()
    nickName: string
    //adress
    @Prop()
    address: string
    //avatar_url
    @Prop()
    avatarUrl: string
    //should_show_tour_guild
    @Prop({
        default: false,
    })
    shouldShowTourGuild: boolean
    //should_show_account_setup_flow
    @Prop({
        default: false,
    })
    shouldShowAccountSetupFlow: boolean
    //interest
    @Prop({})
    interests: [string]
}

export const CatSchema = SchemaFactory.createForClass(User)
