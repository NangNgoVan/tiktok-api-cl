import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { RequirePermissions } from '../../../shared/Decorators/permission.decorator'
import { PermissionGuard } from '../../../shared/Guards/permission.guard'
import { JwtAuthGuard } from 'src/shared/Guards/jwt-auth.guard'
import { UserRolesService } from '../Service/user-roles.service'
import { AssignRolesToUserRequestDto } from '../RequestDTO/assign-roles-to-user-request.dto'

@Controller('cms/users')
@ApiTags('Authorization APIs')
export class UserRolesController {
    constructor(private readonly userRolesService: UserRolesService) {}

    @Post(':id/roles')
    @RequirePermissions(['users:update'])
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @ApiOperation({ summary: 'Assign roles to user by id' })
    @ApiOkResponse()
    async assignRolesToUserById(
        @Param('id') id: string,
        @Body() assignRolesToUserRequestDto: AssignRolesToUserRequestDto,
    ): Promise<void> {
        await this.userRolesService.assignRolesToUser(
            assignRolesToUserRequestDto.roles,
            id,
        )
    }
}
