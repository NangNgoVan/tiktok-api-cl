import {
    ExecutionContext,
    Injectable,
    Logger,
    UnauthorizedException,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Reflector } from '@nestjs/core'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger(JwtAuthGuard.name)

    constructor(private readonly reflector: Reflector) {
        super()
    }

    canActivate(context: ExecutionContext) {
        const isPublic: boolean = this.reflector.get<boolean>(
            'is_public',
            context.getHandler(),
        )

        if (isPublic) {
            return true
        }

        return super.canActivate(context)
    }

    handleRequest(err, user, info, context: ExecutionContext) {
        if (err || !user) {
            if (err) {
                this.logger.error(err)
            }

            const request = context.switchToHttp().getRequest<Request>()

            this.logger.warn({
                message: 'Unauthorized',
                requestUrl: request.url,
            })

            throw err || new UnauthorizedException()
        }

        return user
    }
}
