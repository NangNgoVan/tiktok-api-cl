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
import { BlacklistService } from '../Services/blacklist-redis.service'
import { configService } from '../Services/config.service'
import { RedisService } from '../Services/redis.service'

@Injectable()
export class BlacklistMiddleware implements NestMiddleware {
    constructor(
        private readonly blackListService: BlacklistService,
        private readonly authService: AuthService,
    ) {}

    async use(req: Request, res: Response, next: NextFunction) {
        //check refresh token here
        const refreshToken = req.headers['refresh-token'] // read refresh-token from headers

        const verifiedRefreshToken = await this.authService.verifyJWTToken(
            refreshToken,
            configService.getEnv('JWT_REFRESH_TOKEN_SECRET'),
        )

        if (!refreshToken) {
            throw new UnauthorizedException()
        }

        if (await this.blackListService.getJwtToken(refreshToken)) {
            throw new UnauthorizedException()
        }

        if (!verifiedRefreshToken) {
            throw new RefreshTokenInvalidException()
        } else {
            const userId = verifiedRefreshToken['userId']
            req['userId'] = userId
        }
        next()
    }
}
