import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { RequirePermissions } from '../../../shared/Decorators/permission.decorator'
import { GetRoleResponseDto } from '../ResponseDTO/get-role-response.dto'
import { JwtAuthGuard } from '../../../../shared/Guards/jwt-auth.guard'
import { PermissionGuard } from '../../../shared/Guards/permission.guard'
import { CreateOrUpdateRoleRequestDto } from '../RequestDTO/create-or-update-role-request.dto'
import { RolesService } from '../Service/roles.service'

@Controller('cms/roles')
@ApiTags('Authorization APIs')
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    @Get('all')
    @RequirePermissions(['roles:read'])
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @ApiOperation({ summary: 'Get all roles by alias `all`' })
    @ApiOkResponse({
        type: GetRoleResponseDto,
    })
    async getAllRoles(): Promise<GetRoleResponseDto[]> {
        return this.rolesService.getAllRoles()
    }

    @Post()
    @RequirePermissions(['roles:create', 'roles:update'])
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @ApiOperation({ summary: 'Create or update role' })
    @ApiOkResponse({
        type: GetRoleResponseDto,
    })
    async createOrUpdateRole(
        @Body() createOrUpdateRoleRequestDto: CreateOrUpdateRoleRequestDto,
    ): Promise<GetRoleResponseDto> {
        return this.rolesService.createOrUpdateRole(
            createOrUpdateRoleRequestDto,
        )
    }

    @Delete(':name')
    @RequirePermissions(['roles:delete'])
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @ApiOperation({ summary: 'Delete role by id' })
    @ApiOkResponse()
    async deleteRoleById(@Param('name') name: string): Promise<void> {
        await this.rolesService.deleteByName(name)
    }
}
