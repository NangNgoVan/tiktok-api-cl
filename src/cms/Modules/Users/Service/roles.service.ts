import { Injectable } from '@nestjs/common'
import { RolesRepository } from '../Repositories/roles.repository'
import { RoleDocument } from '../../../../shared/Schemas/role.schema'
import _ from 'lodash'

@Injectable()
export class RolesService {
    constructor(private readonly roleRepository: RolesRepository) {}

    async getEffectivePermissionsByRoles(roles: string[]): Promise<string[]> {
        const roleDocuments = await this.roleRepository.getAllRoles()

        const effectiveRoles: RoleDocument[] = _.filter(
            roleDocuments,
            (roleDocument) => _.includes(roles, roleDocument.name),
        )

        return _.flatMap(effectiveRoles, 'permissions')
    }
}
