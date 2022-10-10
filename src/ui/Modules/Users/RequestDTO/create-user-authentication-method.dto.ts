import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsString } from 'class-validator'
import { AuthenticationMethod } from '../../../../shared/Types/types'

export class CreateUserAuthenticationMethodDto {
    @ApiProperty()
    data?:
        | { address: string }
        | {
              username: string
              password: string
          }

    @ApiProperty()
    @IsString()
    user_id: string

    @ApiProperty()
    @IsEnum({
        enum: AuthenticationMethod,
    })
    authentication_method: AuthenticationMethod
}
