import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import * as mongoose from 'mongoose'
import { AuthenticationMethod } from '../Types/types'
import { IsEnum, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export type UserAuthenticationMethodDocument = UserAuthenticationMethod &
    Document

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    validateBeforeSave: true,
    collection: 'user_authentication_methods',
})
export class UserAuthenticationMethod {
    @ApiProperty()
    @Prop()
    user_id: string

    @ApiProperty()
    @Prop()
    @IsEnum({
        enum: AuthenticationMethod,
    })
    authentication_method: AuthenticationMethod

    @ApiProperty()
    @IsOptional()
    @Prop({ type: mongoose.Schema.Types.Mixed, required: false })
    data?:
        | {
              address: string
          }
        | {
              username: string
              password: string
          }
}

const UserAuthenticationMethodSchema = SchemaFactory.createForClass(
    UserAuthenticationMethod,
)

UserAuthenticationMethodSchema.index(
    { user_id: 1, authentication_method: 1 },
    { unique: true },
)

export { UserAuthenticationMethodSchema }
