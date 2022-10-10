import { Injectable } from '@nestjs/common'
import { RolesRepository } from '../Repositories/roles.repository'
import { RoleDocument } from '../../../../shared/Schemas/role.schema'
import _ from 'lodash'
import { PermissionsService } from './permissions.service'

@Injectable()
export class RolesService {
    constructor(
        private readonly roleRepository: RolesRepository,
        private readonly permissionsService: PermissionsService,
    ) {}

    async getEffectivePermissionsByRoles(roles: string[]): Promise<string[]> {
        const roleDocuments = await this.roleRepository.getAllRoles()

        const effectiveRoles: RoleDocument[] = _.filter(
            roleDocuments,
            (roleDocument) => _.includes(roles, roleDocument.name),
        )

        const combinedPermissions: string[] = _.flatMap(
            effectiveRoles,
            'permissions',
        )

        return this.permissionsService.expandPermissions(combinedPermissions)
    }
}
