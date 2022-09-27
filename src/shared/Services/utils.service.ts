import { Injectable } from '@nestjs/common'
import _ from 'lodash'

@Injectable()
export class UtilsService {
    splitHashtagFromString(content: string): string[] {
        const regexp = /\B\#\w+\b/g
        return _.uniq(content.match(regexp)).map((h) => h.substring(1))
    }
}
