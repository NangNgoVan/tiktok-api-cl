import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
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
import bcrypt from 'bcrypt'
import _ from 'lodash'
import { CreateUserAuthenticationMethodCredentialDto } from '../../Auth/Dto/create-user-authentication-method-credential.dto'
import { GetUserAuthenticationMethodResponseDto } from '../Dto/get-user-authentication-method-response.dto'

@ApiTags('User Authentication Method APIs')
@Controller('ui/users/current/authentication-methods')
export class UserAuthenticationMethodsController {
    constructor(
        private readonly authenticationMethodsService: UserAuthenticationMethodsService,
    ) {}

    @Get()
    @UsePipes(new ValidationPipe())
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get all authentication methods by `current` alias',
    })
    @ApiOkResponse({
        type: GetUserAuthenticationMethodResponseDto,
        isArray: true,
    })
    async getAllAuthenticationMethodsByCurrentUser(
        @Req() req,
    ): Promise<GetUserAuthenticationMethodResponseDto[]> {
        const userId = req.user.userId

        const authenticationMethods =
            await this.authenticationMethodsService.getAllAuthenticationMethodsByUserId(
                userId,
            )

        return _.map(authenticationMethods, (authenticationMethod) =>
            _.pick(authenticationMethod, ['_id', 'authentication_method']),
        )
    }

    @Post('credential')
    @UsePipes(new ValidationPipe())
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Create authentication method credential by `current` alias',
    })
    @ApiOkResponse()
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

    @Delete('metamask')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Delete authentication method metamask by `current` alias',
    })
    @ApiOkResponse()
    async deleteAuthenticationMethodMetamask(@Req() req) {
        const userId = req.user.userId
        await this.authenticationMethodsService.deleteByUserIdAndMethod(
            userId,
            AuthenticationMethod.METAMASK,
        )
    }
}
