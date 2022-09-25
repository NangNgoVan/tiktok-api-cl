import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/shared/Guards/jwt.auth.guard'
import { Interest } from 'src/shared/Schemas/interest.schema'
import { InterestsService } from '../Service/interests.service'

@ApiTags('Interests APIs')
@Controller('ui/configurations')
export class InterestsController {
    constructor(private readonly interestsService: InterestsService) {}

    @Get('/interests/all')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get all interests by alias `all`' })
    @ApiOkResponse({
        description: 'List of Interests',
        type: [Interest],
    })
    async getAllInterests(): Promise<any> {
        const interests = await this.interestsService.getAllInterests()
        const dataResponse = {
            interests: interests,
        }
        return dataResponse
    }
}
