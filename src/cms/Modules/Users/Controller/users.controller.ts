import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import {
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger'
import { UserData } from '../../../../shared/Types/types'
import { CurrentUser } from '../../../../shared/Decorators/current-user.decorator'
import { UsersService } from '../Service/users.service'
import { RequirePermissions } from '../../../shared/Decorators/permission.decorator'
import { GetUserResponseDto } from '../ResponseDTO/get-user-response.dto'
import { PermissionGuard } from '../../../shared/Guards/permission.guard'
import { JwtAuthGuard } from 'src/shared/Guards/jwt-auth.guard'
import { CreateUserWithAuthenticationMethodCredentialRequestDto } from '../RequestDTO/create-user-with-authentication-method-credential-request.dto'

@Controller('cms/users')
@ApiTags('Users APIs')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('current')
    @RequirePermissions(['users:read'])
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @ApiOperation({ summary: 'Get user by alias `current`' })
    @ApiOkResponse({
        type: GetUserResponseDto,
    })
    async getCurrentUser(
        @CurrentUser() currentUser: UserData,
    ): Promise<GetUserResponseDto> {
        return this.usersService.findById(currentUser.userId)
    }

    @Get(':id')
    @RequirePermissions(['users:read'])
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @ApiOperation({ summary: 'Get user by alias `current`' })
    @ApiOkResponse({
        type: GetUserResponseDto,
    })
    @ApiNotFoundResponse()
    async getUserById(@Param('id') id: string): Promise<GetUserResponseDto> {
        return this.usersService.findById(id)
    }

    @Post()
    @RequirePermissions(['users:create'])
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @ApiOperation({
        summary: 'Create user with authentication method credential',
    })
    @ApiOkResponse({ type: GetUserResponseDto })
    async createUserWithAuthenticationMethodCredential(
        @Body()
        createUserWithAuthenticationMethodCredentialRequestDto: CreateUserWithAuthenticationMethodCredentialRequestDto,
    ): Promise<any> {
        return this.usersService.createWithAuthenticationMethodCredential(
            createUserWithAuthenticationMethodCredentialRequestDto,
        )
    }
}
