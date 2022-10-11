import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import _ from 'lodash'
import { ActionsRepository } from '../../Modules/Users/Repository/actions.repository'
import { SubjectsRepository } from '../../Modules/Users/Repository/subjects.repository'
import { UserData } from '../../../shared/Types/types'
import { PermissionsService } from '../../Modules/Users/Service/permissions.service'

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly actionsRepository: ActionsRepository,
        private readonly subjectsRepository: SubjectsRepository,
        private readonly permissionsService: PermissionsService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic: boolean = this.reflector.get<boolean>(
            'is_public',
            context.getHandler(),
        )

        if (isPublic) {
            return true
        }

        const requiredPermissions: string[] = this.reflector.get<string[]>(
            'permissions',
            context.getHandler(),
        )

        const request = context.switchToHttp().getRequest()

        return this.can(request.user, requiredPermissions)
    }

    async can(user: UserData, requiredPermissions: string[]): Promise<boolean> {
        const expandedUserPermissions =
            await this.permissionsService.expandPermissions(
                _.get(user, 'permissions', []),
            )

        const expandedRequirePermissions =
            await this.permissionsService.expandPermissions(requiredPermissions)

        const intersected = _.intersection(
            expandedRequirePermissions,
            expandedUserPermissions,
        )

        return intersected.length === expandedRequirePermissions.length
    }
}
