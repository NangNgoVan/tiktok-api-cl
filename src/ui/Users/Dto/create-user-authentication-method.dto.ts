import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class CreateUserAuthenticationMethodDto {
    @ApiProperty()
    data:
        | {
              address: string
          }
        | {
              username: string
              password: string
          }

    @ApiProperty()
    @IsString()
    user_id: string

    @ApiProperty()
    @IsString()
    authentication_method: 'metamask' | 'credential'
}
