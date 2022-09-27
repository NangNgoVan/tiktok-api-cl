import {
    BadRequestException,
    Body,
    Controller,
    Post,
    Req,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common'

import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger'
import { UserAuthenticationMethodsService } from '../Service/user-authentication-methods.service'
import { AuthenticationMethod } from '../../../shared/Types/types'
import { JwtAuthGuard } from '../../../shared/Guards/jwt.auth.guard'
import { CreateUserAuthenticationMethodCredentialDto } from '../../Auth/Dto/create-user-authentication-method-credential.dto'
import bcrypt from 'bcrypt'
import _ from 'lodash'

@ApiTags('User APIs')
@Controller('ui/users/current/authentication-methods')
export class UserAuthenticationMethodsController {
    constructor(
        private readonly authenticationMethodsService: UserAuthenticationMethodsService,
    ) {}

    @Post('credential')
    @UsePipes(new ValidationPipe())
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Create authentication method credential by `current` alias',
    })
    @ApiOkResponse({
        description: '200',
    })
    async createAuthenticationMethodCredential(
        @Req() req,
        @Body()
        createUserAuthenticationMethodCredentialDto: CreateUserAuthenticationMethodCredentialDto,
    ) {
        const userId = req.user.userId

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

        const createdUserAuthenticationMethod =
            await this.authenticationMethodsService.createAuthenticationMethod({
                authentication_method: AuthenticationMethod.CREDENTIAL,
                data: {
                    username,
                    password: hashed,
                },
                user_id: userId,
            })

        return _.omit(createdUserAuthenticationMethod.toObject(), ['data'])
    }
}
