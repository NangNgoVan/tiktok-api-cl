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
import { ActionsService } from '../Service/actions.service'
import { GetActionResponseDto } from '../ResponseDTO/get-action-response.dto'
import { CreateActionRequestDto } from '../RequestDTO/create-action-request.dto'

@Controller('cms/actions')
@ApiTags('Authorization APIs')
export class ActionsController {
    constructor(private readonly actionsService: ActionsService) {}

    @Get('all')
    @RequirePermissions(['actions:read'])
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @ApiOperation({ summary: 'Get all actions by alias `all`' })
    @ApiOkResponse({
        type: GetRoleResponseDto,
    })
    async getAll(): Promise<GetActionResponseDto[]> {
        return this.actionsService.getAll()
    }

    @Post()
    @RequirePermissions(['actions:create'])
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @ApiOperation({ summary: 'Create action' })
    @ApiOkResponse({
        type: GetActionResponseDto,
    })
    async create(
        @Body() createActionRequestDto: CreateActionRequestDto,
    ): Promise<GetActionResponseDto> {
        return this.actionsService.create(createActionRequestDto)
    }

    @Delete(':name')
    @RequirePermissions(['actions:delete'])
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @ApiOperation({ summary: 'Delete action by id' })
    @ApiOkResponse()
    async deleteByName(@Param('name') name: string): Promise<void> {
        await this.actionsService.deleteByName(name)
    }
}
