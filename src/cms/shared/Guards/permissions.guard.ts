import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import _ from 'lodash'
import { ActionsRepository } from '../Repositories/User/actions.repository'
import { SubjectsRepository } from '../Repositories/User/subjects.repository'
import { ActionDocument } from '../../../shared/Schemas/action.schema'
import { UserData } from '../../../shared/Types/types'

// [1, 2], ["x", "y"] => ["1x", "1y", "2x", "2y"]
const cross = (subjects: string[], actions: string[]): string[] => {
    return _.flatMap(subjects, (subject) => {
        return _.map(actions, (action) => {
            return `${subject}:${action}`
        })
    })
}

/*
    Actions => create, update, delete, read, Subjects: users, feeds, comments

    Input 1:  ['users:*']
    Output 1: ['users:read', 'users:create', 'users:delete', 'users:update']

    Input 2:  ['*:read']  
    Output 2: ['users:read', 'feeds:read', 'comments:read']

    Input 3:  ['*:*'] 
    Output 3: ['users:read', 'users:create', 'users:delete', 'users:update',
    'feeds:read', 'feeds:create', 'feeds:delete', 'feeds:update',
    'comments:read', 'comments:create', 'comments:delete', 'comments:update']
*/
const expandPermissions = (
    compactedPermissions: string[],
    subjects: string[],
    actions: string[],
): string[] => {
    return _.uniq(
        _.flatMap(compactedPermissions, (compactedPermission: string) => {
            const [compactedSubject, compactedAction] = _.split(
                compactedPermission,
                ':',
            )

            const expandedSubjects: string[] =
                compactedSubject === '*' ? subjects : [compactedSubject]

            const expandedActions: string[] =
                compactedAction === '*' ? actions : [compactedAction]

            return cross(expandedSubjects, expandedActions)
        }),
    )
}

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly actionsRepository: ActionsRepository,
        private readonly subjectsRepository: SubjectsRepository,
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
        // FIXME: memo this
        const subjectDocuments: ActionDocument[] =
            await this.subjectsRepository.getAllSubjects()

        const actionDocuments: ActionDocument[] =
            await this.actionsRepository.getAllActions()

        const subjects: string[] = _.map(subjectDocuments, 'name')
        const actions: string[] = _.map(actionDocuments, 'name')

        const expandedUserPermissions = expandPermissions(
            _.get(user, 'permissions', []),
            subjects,
            actions,
        )
        const expandedRequirePermissions = expandPermissions(
            requiredPermissions,
            subjects,
            actions,
        )

        const intersected = _.intersection(
            expandedRequirePermissions,
            expandedUserPermissions,
        )

        return intersected.length === expandedRequirePermissions.length
    }
}
