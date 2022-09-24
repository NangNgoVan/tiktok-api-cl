import {
    Injectable,
    NestMiddleware,
    UnauthorizedException,
    Request,
    Response,
} from '@nestjs/common'
import { NextFunction } from 'express'
import { RefreshTokenInvalidException } from '../Exceptions/http.exceptions'
import { AuthService } from '../Services/auth.service'
import { configService } from '../Services/config.service'
import { RedisService } from '../Services/redis.service'

@Injectable()
export class BlacklistMiddleware implements NestMiddleware {
    constructor(
        private readonly redisService: RedisService,
        private readonly authService: AuthService,
    ) {}

    async use(req: Request, res: Response, next: NextFunction) {
        //check refresh token here
        const refreshToken = req.headers['refresh-token'] // read refresh-token from headers

        if (!refreshToken /**or refresh token not in the blacklist */) {
            throw new UnauthorizedException()
        }

        if (
            !(await this.authService.verifyJWTToken(
                refreshToken,
                configService.getEnv('JWT_REFRESH_TOKEN_SECRET'),
            ))
        ) {
            throw new RefreshTokenInvalidException()
        }
        next()
    }
}
