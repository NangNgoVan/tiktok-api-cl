import { Injectable } from '@nestjs/common'
import { UserInterestRepository } from '../Repository/user-interest.repository'
import { InterestService } from './interest.service'

@Injectable()
export class UserInterestService {
    constructor(
        private readonly userInterestRepository: UserInterestRepository,
        private readonly interestService: InterestService,
    ) {}

    async createOrUpdate(userId: string, interestIds: string[]) {
        await this.userInterestRepository.delete(userId)

        const validInterestIds: string[] = await this.interestService.cleanup(
            interestIds,
        )

        return this.userInterestRepository.create(userId, validInterestIds)
    }
}
