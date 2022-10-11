import { Injectable } from '@nestjs/common'
import _ from 'lodash'
import { ActionDocument } from '../../../../shared/Schemas/action.schema'
import { ActionsRepository } from '../Repository/actions.repository'
import { SubjectsRepository } from '../Repository/subjects.repository'

@Injectable()
export class PermissionsService {
    constructor(
        private readonly actionsRepository: ActionsRepository,
        private readonly subjectsRepository: SubjectsRepository,
    ) {}

    // [1, 2], ["x", "y"] => ["1x", "1y", "2x", "2y"]
    cross(subjects: string[], actions: string[]): string[] {
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
    async expandPermissions(compactedPermissions: string[]): Promise<string[]> {
        // FIXME: memo this
        // FIXME: should cleanup before expand
        const subjectDocuments: ActionDocument[] =
            await this.subjectsRepository.getAllSubjects()

        const actionDocuments: ActionDocument[] =
            await this.actionsRepository.getAllActions()

        const availableSubjects: string[] = _.map(subjectDocuments, 'name')
        const availableActions: string[] = _.map(actionDocuments, 'name')

        const expandedPermissions: string[] = _.flatMap(
            compactedPermissions,
            (compactedPermission: string) => {
                const [compactedSubject, compactedAction] = _.split(
                    compactedPermission,
                    ':',
                )

                const expandedSubjects: string[] =
                    compactedSubject === '*'
                        ? availableSubjects
                        : [compactedSubject]

                const expandedActions: string[] =
                    compactedAction === '*'
                        ? availableActions
                        : [compactedAction]

                return this.cross(expandedSubjects, expandedActions)
            },
        )

        return _.uniq(expandedPermissions)
    }

    async cleanupPermissions(dirtyPermissions: string[]): Promise<string[]> {
        // FIXME: memo this
        const subjectDocuments: ActionDocument[] =
            await this.subjectsRepository.getAllSubjects()

        const actionDocuments: ActionDocument[] =
            await this.actionsRepository.getAllActions()

        const availableSubjects: string[] = _.map(subjectDocuments, 'name')
        const availableActions: string[] = _.map(actionDocuments, 'name')

        const validPermissions: string[] = _.filter(
            dirtyPermissions,
            (dirtyPermission: string) => {
                const [subject, action] = _.split(dirtyPermission, ':')

                const isSubjectValid = _.includes(
                    [...availableSubjects, '*'],
                    subject,
                )

                const isActionValid = _.includes(
                    [...availableActions, '*'],
                    action,
                )

                return isSubjectValid && isActionValid
            },
        )

        return _.uniq(validPermissions)
    }
}
