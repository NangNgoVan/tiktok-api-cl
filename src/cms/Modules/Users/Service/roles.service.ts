import { Injectable, Logger } from '@nestjs/common'
import { RolesRepository } from '../Repository/roles.repository'
import { RoleDocument } from '../../../../shared/Schemas/role.schema'
import _ from 'lodash'
import { PermissionsService } from './permissions.service'
import { GetRoleResponseDto } from '../ResponseDTO/get-role-response.dto'
import { CreateOrUpdateRoleRequestDto } from '../RequestDTO/create-or-update-role-request.dto'
import { Cacheable } from '@type-cacheable/core'

@Injectable()
export class RolesService {
    private readonly logger: Logger = new Logger(RolesService.name)

    constructor(
        private readonly roleRepository: RolesRepository,
        private readonly permissionsService: PermissionsService,
    ) {}

    async getAllRoles(): Promise<GetRoleResponseDto[]> {
        await this.reconcilePermissionsForAllRoles({
            disableCache: false,
        })

        const roles: RoleDocument[] = await this.roleRepository.getAllRoles()

        return Promise.all(
            _.map(roles, async (role: RoleDocument) => {
                const expandPermissions: string[] =
                    await this.permissionsService.expandPermissions(
                        role.permissions,
                    )

                return {
                    _id: role._id,
                    name: role.name,
                    permissions: expandPermissions,
                }
            }),
        )
    }

    async createOrUpdateRole(
        createOrUpdateRoleRequestDto: CreateOrUpdateRoleRequestDto,
    ): Promise<GetRoleResponseDto> {
        const cleanedPermissions: string[] =
            await this.permissionsService.cleanupPermissions(
                createOrUpdateRoleRequestDto.permissions,
            )

        return this.roleRepository.createOrUpdate(
            createOrUpdateRoleRequestDto.name,
            cleanedPermissions,
        )
    }

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

    async deleteByName(name: string) {
        await this.roleRepository.deleteByName(name)
    }

    async cleanupRoles(roles: string[]): Promise<string[]> {
        const roleDocuments: RoleDocument[] =
            await this.roleRepository.getAllRoles()

        const availableRoles: string[] = _.map(roleDocuments, 'name')

        return _.uniq(
            _.compact(
                _.filter(roles, (role: string) =>
                    _.includes(availableRoles, role),
                ),
            ),
        )
    }

    @Cacheable({
        cacheKey: 'ui:roles:permission-reconciliation',
        noop: (args: any[]) => _.get(args, '0.disableCache', true),
        ttlSeconds: (args: any[]) =>
            _.get(args, '0.cacheForSeconds', 10 * 60 * 60),
    })
    async reconcilePermissionsForAllRoles(
        // eslint-disable-next-line
        cacheOptions?: {
            disableCache?: boolean
            cacheForSeconds?: number
        },
    ): Promise<void> {
        const roleDocuments: RoleDocument[] =
            await this.roleRepository.getAllRoles()

        await Promise.all(
            _.map(roleDocuments, async (roleDocument: RoleDocument) => {
                roleDocument.permissions =
                    await this.permissionsService.cleanupPermissions(
                        roleDocument.permissions,
                    )

                await roleDocument.save()
            }),
        )
    }
}
