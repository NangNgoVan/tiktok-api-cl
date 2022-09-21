import {
    BadRequestException,
    Body,
    Controller,
    Get,
    NotFoundException,
    Param,
    Patch,
    Req,
    UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserNotFoundException } from 'src/shared/Exceptions/http.exceptions'
import { JwtAuthGuard } from 'src/shared/Guards/jwt.auth.guard'
import { UserDataResponse } from 'src/shared/Services/data-serializer.service'
import { HttpStatusResult } from 'src/shared/Types/types'
import { GetUserDto } from '../Dto/get-user.dto'
import { UpdateUserDto } from '../Dto/update-user.dto'
import { UsersService } from '../Service/users.service'

@Controller('ui/users')
@ApiTags('User API')
export class UserController {
    constructor(private readonly userService: UsersService) {}

    @ApiBearerAuth()
    @Get('/current')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async getCurrentUser(@Req() req): Promise<any> {
        const { userId } = req.user
        const user = await this.userService.findById(userId)
        console.log(user)
        return user
    }

    //Update current user
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Patch('/current')
    async updateCurrentUser(
        @Req() req,
        @Body() dto: UpdateUserDto,
    ): Promise<HttpStatusResult> {
        const { userId } = req.user
        const updatedUser = await this.userService.updateUser(userId, dto)

        if (!updatedUser) throw new BadRequestException()

        return {
            statusCode: 200,
            message: 'Update user success',
        }
    }

    //Get user by Id
    @Get('/:userId')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async getUserById(@Param() params): Promise<object> {
        const id = params.userId
        const user = await this.userService.findById(id)
        if (!user) throw new UserNotFoundException()
        //
        return user
    }
}
