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
import { BlacklistTokenService } from '../Services/blacklist-token.service'
import { configService } from '../Services/config.service'

@Injectable()
export class BlacklistMiddleware implements NestMiddleware {
    constructor(
        private readonly blackListTokenService: BlacklistTokenService,
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

        if (await this.blackListTokenService.hasToken(refreshToken)) {
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
