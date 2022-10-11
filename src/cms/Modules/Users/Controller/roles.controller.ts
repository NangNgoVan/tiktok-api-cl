import {
    Body,
    Controller,
    Get,
    NotImplementedException,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common'
import {
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
} from '@nestjs/swagger'
import { UserData } from '../../../../shared/Types/types'
import { CurrentUser } from '../../../../shared/Decorators/current-user.decorator'
import { UsersService } from '../Service/users.service'
import { RequirePermissions } from '../../../shared/Decorators/permission.decorator'
import { GetRoleResponseDto } from '../ResponseDTO/get-role-response.dto'
import { JwtAuthGuard } from '../../../../shared/Guards/jwt-auth.guard'
import { PermissionGuard } from '../../../shared/Guards/permission.guard'
import { CreateRoleRequestDto } from '../RequestDTO/create-role-request.dto'

@Controller('cms/roles')
export class RolesController {
    constructor(private readonly usersService: UsersService) {}

    @Get('all')
    @RequirePermissions(['roles:read'])
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @ApiOperation({ summary: 'Get all roles by alias `all`' })
    @ApiOkResponse({
        type: GetRoleResponseDto,
    })
    async getAllRoles(): Promise<GetRoleResponseDto> {
        throw new Error()
    }

    @Post()
    @RequirePermissions(['roles:create'])
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @ApiOperation({ summary: 'Create role' })
    @ApiOkResponse({
        type: CreateRoleRequestDto,
    })
    async createRole(@Body() dto: CreateRoleRequestDto): Promise<void> {
        throw new Error()
    }
}
