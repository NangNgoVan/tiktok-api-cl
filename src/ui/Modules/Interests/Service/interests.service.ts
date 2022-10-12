import { Injectable } from '@nestjs/common'
import { InterestsRepository } from '../Repository/interests.repository'
import { GetInterestResponseDto } from '../ResponseDTO/get-interest-response.dto'

@Injectable()
export class InterestsService {
    constructor(private readonly interestsRepository: InterestsRepository) {}

    async getAll(): Promise<GetInterestResponseDto[]> {
        return this.interestsRepository.getAll({
            disableCache: false,
        })
    }
}
