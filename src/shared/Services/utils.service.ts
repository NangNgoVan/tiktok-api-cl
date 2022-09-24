import { Injectable } from '@nestjs/common'

@Injectable()
export class UtilsService {
    splitHashtagFromString(content: string): string[] {
        const regexp = /\B\#\w\w+\b/g
        return content.match(regexp)
    }
}
