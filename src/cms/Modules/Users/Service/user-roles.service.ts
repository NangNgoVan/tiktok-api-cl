import { Injectable, NotFoundException } from '@nestjs/common'
import _ from 'lodash'
import { UsersRepository } from '../Repository/users.repository'
import { UserDocument } from '../../../../shared/Schemas/user.schema'

@Injectable()
export class UserRolesService {
    constructor(private readonly userRepository: UsersRepository) {}

    async assignRolesToUser(roles: string[], userId: string): Promise<void> {
        const userDocument: UserDocument = await this.userRepository.getById(
            userId,
        )

        if (!userDocument) {
            throw new NotFoundException(`User ${userId} not found`)
        }

        // FIXME: should cleanup roles before save
        userDocument.roles = _.compact(_.uniq(roles))

        await userDocument.save()
    }
}
