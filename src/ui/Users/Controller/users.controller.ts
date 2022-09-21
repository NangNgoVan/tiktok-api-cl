import { Controller, Get, Patch, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/shared/Guards/jwt.auth.guard'
import { UserDataResponse } from 'src/shared/Services/data-serializer.service'
import { HttpStatusResult } from 'src/shared/Types/types'
import { UserService } from '../Service/users.service'

@Controller('ui/users')
@ApiTags('User API')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('/current')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async getCurrentUser(): Promise<UserDataResponse> {
        const userDataResponse = {
            id: 'id',
            name: 'name',
        }
        return userDataResponse
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/current')
    async updateCurrentUser(): Promise<HttpStatusResult> {
        return {
            statusCode: 200,
            message: 'Update user success',
        }
    }

    @Get('/:userId')
    async getUserById(): Promise<UserDataResponse> {
        const userDataResponse = {
            id: 'id',
            name: 'name',
        }
        return userDataResponse
    }

    @Get('/test')
    async test() {
        return this.userService.create({})
    }
}
