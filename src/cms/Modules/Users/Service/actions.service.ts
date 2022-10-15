import { Injectable } from '@nestjs/common'
import { GetActionResponseDto } from '../ResponseDTO/get-action-response.dto'
import { ActionsRepository } from '../Repository/actions.repository'
import { CreateActionRequestDto } from '../RequestDTO/create-action-request.dto'

@Injectable()
export class ActionsService {
    constructor(private readonly actionRepository: ActionsRepository) {}

    async getAll(): Promise<GetActionResponseDto[]> {
        return this.actionRepository.getAll()
    }

    async create(
        createActionRequestDto: CreateActionRequestDto,
    ): Promise<GetActionResponseDto> {
        return this.actionRepository.create(createActionRequestDto.name)
    }

    async deleteByName(name: string) {
        await this.actionRepository.deleteByName(name)
    }
}
