import { Controller, Get, UseGuards } from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/shared/Guards/jwt-auth.guard'
import { InterestsService } from '../Service/interests.service'
import { GetInterestResponseDto } from '../ResponseDTO/get-interest-response.dto'

@ApiTags('Interests APIs')
@Controller('ui/configurations')
export class InterestsController {
    constructor(private readonly interestsService: InterestsService) {}

    @Get('/interests/all')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get all interests by alias `all`' })
    @ApiOkResponse({
        description: 'List of Interests',
        type: GetInterestResponseDto,
        isArray: true,
    })
    async getAll(): Promise<any> {
        return this.interestsService.getAll()
    }
}
