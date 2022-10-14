import { Injectable } from '@nestjs/common'
import _ from 'lodash'

@Injectable()
export class UtilsService {
    extractHashtagFromString(content: string): string[] {
        if (!content) return []
        const regexp = /\B\#\w+\b/g
        return _.compact(
            _.uniq(content.match(regexp)).map((h) => h.substring(1)),
        )
    }
}
