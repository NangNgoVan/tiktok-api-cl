import {
    BadRequestException,
    Body,
    Controller,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common'

import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger'
import { UserAuthenticationMethodsService } from '../../Users/Service/user-authentication-methods.service'
import { AuthenticationMethod } from '../../../shared/Types/types'
import { UserAuthenticationMethod } from '../../../shared/Schemas/user-authentication-method.schema'
import { JwtAuthGuard } from '../../../shared/Guards/jwt.auth.guard'
import { CreateUserAuthenticationMethodCredentialDto } from '../Dto/create-user-authentication-method-credential.dto'
import bcrypt from 'bcrypt'

@ApiTags('Authentication Methods')
@Controller('ui/authentication-methods')
export class AuthenticationMethodsController {
    constructor(
        private readonly authenticationMethodsService: UserAuthenticationMethodsService,
    ) {}

    @Post('login')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create authentication method login' })
    @ApiOkResponse({
        description: '200',
    })
    async createAuthenticationMethodLogin(
        @Req() req,
        @Body()
        createUserAuthenticationMethodCredentialDto: CreateUserAuthenticationMethodCredentialDto,
    ): Promise<Omit<UserAuthenticationMethod, 'data'>> {
        const userId = req.userId

        const { username, password, password_confirmation } =
            createUserAuthenticationMethodCredentialDto

        if (password !== password_confirmation) {
            throw new BadRequestException(
                'Password confirmation does not match',
            )
        }

        const userAuthenticationMethod =
            await this.authenticationMethodsService.findByUsername(username)

        if (userAuthenticationMethod) {
            throw new BadRequestException(
                'User authentication method credential already exists',
            )
        }

        const salt = await bcrypt.genSalt(10)
        const hashed = await bcrypt.hash(password, salt)

        return this.authenticationMethodsService.createAuthenticationMethod({
            authentication_method: AuthenticationMethod.CREDENTIAL,
            data: {
                username,
                password: hashed,
            },
            user_id: userId,
        })
    }
}
