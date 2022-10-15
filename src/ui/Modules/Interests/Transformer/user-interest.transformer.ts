import { Injectable } from '@nestjs/common'
import { CreateOrUpdateUserInterestResponseDto } from '../ResponseDTO/create-or-update-user-interest-response.dto'
import _ from 'lodash'
import { UserInterestDocument } from '../../../../shared/Schemas/user-interest.schema'
import { GetUserInterestResponseDto } from '../ResponseDTO/get-user-interest-response.dto'
import { InterestDocument } from 'src/shared/Schemas/interest.schema'

@Injectable()
export class UserInterestTransformer {
    // -------------------------------------------

    transformCreatedUserInterestDocumentToCreateOrUpdateUserInterestRequestDto(
        createdUserInterestDocument: UserInterestDocument,
    ): CreateOrUpdateUserInterestResponseDto {
        return _.pick(createdUserInterestDocument, [
            '_id',
            'user_id',
            'interest_id',
        ]) as CreateOrUpdateUserInterestResponseDto
    }

    transformCreatedUserInterestDocumentsToCreateOrUpdateUserInterestRequestDtos(
        createdUserInterestDocuments: UserInterestDocument[],
    ): CreateOrUpdateUserInterestResponseDto[] {
        return _.map(
            createdUserInterestDocuments,
            (createdUserInterestDocument) => {
                return this.transformCreatedUserInterestDocumentToCreateOrUpdateUserInterestRequestDto(
                    createdUserInterestDocument,
                )
            },
        )
    }

    // -------------------------------------------

    transformUserInterestDocumentToGetUserInterestRequestDto(
        userInterestDocument: Required<UserInterestDocument>,
        interestDocumentHashMapOrArray:
            | Record<string, InterestDocument>
            | InterestDocument[],
    ): GetUserInterestResponseDto {
        const interestDocumentHashMap: Record<string, InterestDocument> =
            _.isArray(interestDocumentHashMapOrArray)
                ? _.keyBy(interestDocumentHashMapOrArray, '_id')
                : interestDocumentHashMapOrArray

        const interestDocument: InterestDocument = _.get(
            interestDocumentHashMap,
            userInterestDocument.interest_id,
        )

        return {
            ..._.pick(userInterestDocument, ['_id', 'user_id', 'interest_id']),
            interest_name: _.get(interestDocument, 'name'),
        }
    }

    transformUserInterestDocumentsToGetUserInterestRequestDtos(
        userInterestDocuments: UserInterestDocument[],
        interestDocuments: InterestDocument[],
    ): GetUserInterestResponseDto[] {
        const interestDocumentHashMap: Record<string, InterestDocument> =
            _.keyBy(interestDocuments, '_id')

        return _.map(
            userInterestDocuments,
            (userInterestDocument: Required<UserInterestDocument>) => {
                return this.transformUserInterestDocumentToGetUserInterestRequestDto(
                    userInterestDocument,
                    interestDocumentHashMap,
                )
            },
        )
    }

    // -------------------------------------------
}
