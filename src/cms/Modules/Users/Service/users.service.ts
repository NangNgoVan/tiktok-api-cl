import { Injectable, NotFoundException } from '@nestjs/common'
import { GetUserResponseDto } from '../ResponseDTO/get-user-response.dto'
import _ from 'lodash'
import { RolesService } from './roles.service'
import { UsersRepository } from '../Repositories/users.repository'

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
