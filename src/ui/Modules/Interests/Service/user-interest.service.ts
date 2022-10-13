import { Injectable } from '@nestjs/common'
import { UserInterestRepository } from '../Repository/user-interest.repository'
import { InterestRepository } from '../Repository/interest.repository'
import { InterestService } from './interest.service'
import { CreateOrUpdateUserInterestResponseDto } from '../ResponseDTO/create-or-update-user-interest-response.dto'
import { UserInterestTransformer } from '../Transformer/user-interest.transformer'
import { GetUserInterestResponseDto } from '../ResponseDTO/get-user-interest-response.dto'
import { InterestDocument } from 'src/shared/Schemas/interest.schema'
import { UserInterestDocument } from 'src/shared/Schemas/user-interest.schema'

@Injectable()
export class UserInterestService {
    constructor(
        private readonly userInterestRepository: UserInterestRepository,
        private readonly interestRepository: InterestRepository,
        private readonly interestService: InterestService,
        private readonly userInterestTransformer: UserInterestTransformer,
    ) { }

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

    async getByUserId(
        userId: string,
    ): Promise<GetUserInterestResponseDto[]> {
        const userInterestDocuments: UserInterestDocument[] = await this.userInterestRepository.getByUserId(userId)
        const interestDocuments: InterestDocument[] = await this.interestRepository.getAll()

        return this.userInterestTransformer.transformUserInterestDocumentsToGetUserInterestRequestDtos(
            userInterestDocuments,
            interestDocuments
        )
    }
}
