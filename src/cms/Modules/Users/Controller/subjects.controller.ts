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
import { SubjectsService } from '../Service/subjects.service'
import { GetSubjectResponseDto } from '../ResponseDTO/get-subject-response.dto'
import { CreateSubjectRequestDto } from '../RequestDTO/create-subject-request.dto'

@Controller('cms/subjects')
@ApiTags('Authorization APIs')
export class SubjectsController {
    constructor(private readonly subjectService: SubjectsService) {}

    @Get('all')
    @RequirePermissions(['subjects:read'])
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @ApiOperation({ summary: 'Get all subjects by alias `all`' })
    @ApiOkResponse({
        type: GetRoleResponseDto,
    })
    async getAll(): Promise<GetSubjectResponseDto[]> {
        return this.subjectService.getAll()
    }

    @Post()
    @RequirePermissions(['subjects:create'])
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @ApiOperation({ summary: 'Create subject' })
    @ApiOkResponse({
        type: GetSubjectResponseDto,
    })
    async create(
        @Body() createSubjectRequestDto: CreateSubjectRequestDto,
    ): Promise<GetSubjectResponseDto> {
        return this.subjectService.create(createSubjectRequestDto)
    }

    @Delete(':name')
    @RequirePermissions(['subjects:delete'])
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @ApiOperation({ summary: 'Delete subject by id' })
    @ApiOkResponse()
    async deleteByName(@Param('name') name: string): Promise<void> {
        await this.subjectService.deleteByName(name)
    }
}
