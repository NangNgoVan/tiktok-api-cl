import { Body, Controller, Put, Get, UseGuards } from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/shared/Guards/jwt-auth.guard'
import { CurrentUser } from '../../../../shared/Decorators/current-user.decorator'
import { UserData } from '../../../../shared/Types/types'
import { UserInterestService } from '../Service/user-interest.service'
import { CreateOrUpdateUserInterestResponseDto } from '../ResponseDTO/create-or-update-user-interest-response.dto'
import { CreateOrUpdateUserInterestRequestDto } from '../RequestDTO/create-or-update-user-interest-request.dto'
import { GetUserInterestResponseDto } from '../ResponseDTO/get-user-interest-response.dto'

@ApiTags('User Interests APIs')
@Controller('ui/users')
export class UserInterestController {
    constructor(private readonly userInterestService: UserInterestService) {}

    @Put('/current/interests')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: "Create or Update current user's interests",
    })
    @ApiOkResponse()
    async updateCurrentUserInterests(
        @CurrentUser() currentUser: UserData,
        @Body()
        createOrUpdateUserInterestResponseDto: CreateOrUpdateUserInterestRequestDto,
    ): Promise<CreateOrUpdateUserInterestResponseDto[]> {
        return this.userInterestService.createOrUpdate(
            currentUser.userId,
            createOrUpdateUserInterestResponseDto.interest_ids,
        )
    }

    @Get('/current/interests')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: "Get current user's interests",
    })
    @ApiOkResponse({
        type: GetUserInterestResponseDto,
    })
    async getCurrentUserInterests(
        @CurrentUser() currentUser: UserData,
    ): Promise<GetUserInterestResponseDto[]> {
        return this.userInterestService.getByUserId(currentUser.userId)
    }

    @Get('/:userId/interests')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: "Get user's interests",
    })
    @ApiOkResponse({
        type: GetUserInterestResponseDto,
    })
    async getUserInterests(
        @CurrentUser() currentUser: UserData,
    ): Promise<GetUserInterestResponseDto[]> {
        return this.userInterestService.getByUserId(currentUser.userId)
    }
}
