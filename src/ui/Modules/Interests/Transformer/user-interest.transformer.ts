import { Injectable } from '@nestjs/common'
import { CreateOrUpdateUserInterestResponseDto } from '../ResponseDTO/create-or-update-user-interest-response.dto'
import _ from 'lodash'
import { UserInterestDocument } from '../../../../shared/Schemas/user-interest.schema'

@Injectable()
export class UserInterestTransformer {
    transformCreatedUserInterestDocumentToCreateOrUpdateUserInterestRequestDto(
        createdUserInterestDocument: UserInterestDocument,
    ): CreateOrUpdateUserInterestResponseDto {
        return _.pick(createdUserInterestDocument, [
            '_id',
            'user_id',
            'interest_id',
        ]) as CreateOrUpdateUserInterestResponseDto
    }

    async transformCreatedUserInterestDocumentsToCreateOrUpdateUserInterestRequestDtos(
        createdUserInterestDocuments: UserInterestDocument[],
    ): Promise<CreateOrUpdateUserInterestResponseDto[]> {
        return _.map(
            createdUserInterestDocuments,
            (createdUserInterestDocument) => {
                return this.transformCreatedUserInterestDocumentToCreateOrUpdateUserInterestRequestDto(
                    createdUserInterestDocument,
                )
            },
        )
    }
}
