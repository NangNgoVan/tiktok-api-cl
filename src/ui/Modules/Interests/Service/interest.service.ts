import { Injectable } from '@nestjs/common'
import { InterestRepository } from '../Repository/interest.repository'
import { GetInterestResponseDto } from '../ResponseDTO/get-interest-response.dto'
import { InterestDocument } from '../../../../shared/Schemas/interest.schema'
import _ from 'lodash'

@Injectable()
export class InterestService {
    constructor(private readonly interestRepository: InterestRepository) {}

    async getAll(): Promise<GetInterestResponseDto[]> {
        return this.interestRepository.getAll({
            disableCache: false,
        })
    }

    async cleanup(interestIds: string[]): Promise<string[]> {
        const interests: InterestDocument[] =
            await this.interestRepository.getAll()

        const availableInterestIds: string[] = _.map(interests, 'id')

        return _.uniq(
            _.filter(interestIds, (interestId: string) =>
                _.includes(availableInterestIds, interestId),
            ),
        )
    }
}
