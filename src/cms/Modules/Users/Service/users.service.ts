import { Injectable, NotFoundException } from '@nestjs/common'
import { UsersRepository } from '../../../shared/Repositories/User/users.repository'
import { GetUserResponseDto } from '../ResponseDTO/get-user-response.dto'
import _ from 'lodash'
import { RolesService } from '../../../shared/Services/roles.service'

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly rolesService: RolesService,
    ) {}

    async getById(id: string): Promise<GetUserResponseDto> {
        const userDocument = await this.usersRepository.getById(id)

        if (!userDocument) {
            throw new NotFoundException(`User ${id} not found`)
        }

        const roles: string[] = _.get(userDocument, 'roles', [])

        const effectivePermissions: string[] =
            await this.rolesService.getEffectivePermissionsByRoles(roles)

        return { ...userDocument.toObject(), permissions: effectivePermissions }
    }
}
