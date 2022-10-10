// FIXME: remove this use is_public instead
import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import _ from 'lodash'

@Injectable()
export class AnonymousGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        return super.canActivate(context)
    }

    handleRequest(err, user, info, context: ExecutionContext) {
        if (err || !user) {
            const request = context.switchToHttp().getRequest()
            const authorizationHeader = _.get(request, 'headers.authorization')
            if (authorizationHeader) {
                throw new UnauthorizedException()
            }
        }
        return user
    }
}
