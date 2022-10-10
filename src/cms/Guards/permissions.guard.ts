import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import _ from 'lodash'

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
    return _.flatMap(compactedPermissions, (compactedPermission: string) => {
        const [compactedSubject, compactedAction] = _.split(
            compactedPermission,
            ':',
        )

        const expandedSubjects: string[] =
            compactedSubject === '*' ? subjects : [compactedSubject]

        const expandedActions: string[] =
            compactedAction === '*' ? actions : [compactedAction]

        return cross(expandedSubjects, expandedActions)
    })
}

const can = (
    user: { userId: string; roles: string[]; permissions: string[] },
    requiredPermissions: string[],
): boolean => {
    // FIXME: fetch from database (memo - cache)
    const subjects = []
    const actions = []

    // FIXME: move this to canDo function
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

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
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

        return can(request.user, requiredPermissions)
    }
}
