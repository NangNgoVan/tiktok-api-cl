import { Injectable } from '@nestjs/common'
import { UserInterestRepository } from '../Repository/user-interest.repository'
import { InterestService } from './interest.service'
import { CreateOrUpdateUserInterestResponseDto } from '../ResponseDTO/create-or-update-user-interest-response.dto'
import { UserInterestTransformer } from '../Transformer/user-interest.transformer'

@Injectable()
export class UserInterestService {
    constructor(
        private readonly userInterestRepository: UserInterestRepository,
        private readonly interestService: InterestService,
        private readonly userInterestTransformer: UserInterestTransformer,
    ) {}

    async createOrUpdate(
        userId: string,
        interestIds: string[],
    ): Promise<CreateOrUpdateUserInterestResponseDto[]> {
        await this.userInterestRepository.delete(userId)

        const validInterestIds: string[] = await this.interestService.cleanup(
            interestIds,
        )

        const createdUserInterestDocuments =
            await this.userInterestRepository.create(userId, validInterestIds)

        return this.userInterestTransformer.transformCreatedUserInterestDocumentsToCreateOrUpdateUserInterestRequestDtos(
            createdUserInterestDocuments,
        )
    }
}
