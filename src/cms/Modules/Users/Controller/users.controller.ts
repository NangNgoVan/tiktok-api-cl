import {
    Body,
    Controller,
    Get,
    NotImplementedException,
    Param,
    Post,
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
import { GetUserResponseDto } from '../ResponseDTO/get-user-response.dto'

@Controller('cms/users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('current')
    @RequirePermissions(['users:read'])
    @ApiOperation({ summary: 'Get user by alias `current`' })
    @ApiOkResponse({
        type: GetUserResponseDto,
    })
    async getCurrentUser(@CurrentUser() currentUser: UserData): Promise<any> {
        return this.usersService.getById(currentUser.userId)
    }

    @Get(':id')
    @RequirePermissions(['users:read'])
    @ApiOperation({ summary: 'Get user by alias `current`' })
    @ApiOkResponse({
        type: GetUserResponseDto,
    })
    @ApiNotFoundResponse()
    async getUserById(@Param('id') id: string): Promise<GetUserResponseDto> {
        return this.usersService.getById(id)
    }

    @Post()
    @RequirePermissions(['users:create'])
    @ApiOperation({ summary: '....' })
    @ApiOkResponse({})
    async create(@Body() dto: any): Promise<any> {
        throw new NotImplementedException(dto)
    }
}
