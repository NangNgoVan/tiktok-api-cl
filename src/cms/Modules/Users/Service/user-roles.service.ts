import { Injectable, NotFoundException } from '@nestjs/common'
import { UsersRepository } from '../Repository/users.repository'
import { UserDocument } from '../../../../shared/Schemas/user.schema'
import { RolesService } from './roles.service'

@Injectable()
export class UserRolesService {
    constructor(
        private readonly userRepository: UsersRepository,
        private readonly rolesService: RolesService,
    ) {}

    async assignRolesToUser(roles: string[], userId: string): Promise<void> {
        const userDocument: UserDocument = await this.userRepository.getById(
            userId,
        )

        if (!userDocument) {
            throw new NotFoundException(`User ${userId} not found`)
        }

        userDocument.roles = await this.rolesService.cleanupRoles(roles)

        await userDocument.save()
    }

    async reconcileRolesForUser(userId: string): Promise<void> {
        const userDocument: UserDocument = await this.userRepository.getById(
            userId,
        )

        if (!userDocument) {
            throw new NotFoundException(`User ${userId} not found`)
        }

        const oldRolesNeedReconcile: string[] = userDocument.roles

        userDocument.roles = await this.rolesService.cleanupRoles(
            oldRolesNeedReconcile,
        )

        await userDocument.save()
    }
}
