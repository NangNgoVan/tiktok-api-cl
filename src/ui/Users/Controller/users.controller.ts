import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Logger,
    NotFoundException,
    Param,
    Patch,
    Req,
    UseGuards,
} from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger'
import { UserNotFoundException } from 'src/shared/Exceptions/http.exceptions'
import { JwtAuthGuard } from 'src/shared/Guards/jwt.auth.guard'
import { UserDataResponse } from 'src/shared/Services/data-serializer.service'
import { HttpStatusResult } from 'src/shared/Types/types'
import { GetUserDto } from '../Dto/get-user.dto'
import { UpdateUserDto } from '../Dto/update-user.dto'
import { UsersService } from '../Service/users.service'
import { User } from '../../../shared/Schemas/user.schema'

@Controller('ui/users')
@ApiTags('User API')
export class UserController {
    constructor(
        private readonly userService: UsersService,
        private logger: Logger,
    ) {}

    @Get('/current')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'get user by `current` alias' })
    @ApiOkResponse({
        description: '200',
        type: User,
    })
    async getCurrentUser(@Req() req): Promise<any> {
        const { userId } = req.user
        const user = await this.userService.findById(userId)
        this.logger.log(user)
        return user
    }

    //Update current user
    @UseGuards(JwtAuthGuard)
    @Patch('/current')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'update user by `current` alias' })
    @ApiOkResponse({
        description: '200',
    })
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
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'update user by user id' })
    @ApiOkResponse({
        description: '200',
        type: User,
    })
    @ApiNotFoundResponse()
    async getUserById(@Param() params): Promise<object> {
        const id = params.userId
        const user = await this.userService.findById(id)
        if (!user) throw new UserNotFoundException()
        //
        return user
    }
}
