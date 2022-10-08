import {
    Injectable,
    NestMiddleware,
    UnauthorizedException,
    Request,
    Response,
} from '@nestjs/common'
import { NextFunction } from 'express'
import { RefreshTokenInvalidException } from '../Exceptions/http.exceptions'
import { RefreshTokenBlacklistService } from '../Services/refresh-token-blacklist.service'
import { configService } from '../Services/config.service'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class RefreshTokenBlacklistMiddleware implements NestMiddleware {
    constructor(
        private readonly refreshTokenBlacklistService: RefreshTokenBlacklistService,
        private readonly jwtService: JwtService,
    ) {}

    async use(req: Request, res: Response, next: NextFunction) {
        const refreshToken = req.headers['refresh-token']

        if (!refreshToken) {
            throw new UnauthorizedException()
        }

        const data = this.jwtService
            .verify(refreshToken, {
                secret: configService.getEnv('JWT_REFRESH_TOKEN_SECRET'),
            })
            .cacth(() => undefined)

        if (!data) {
            throw new RefreshTokenInvalidException()
        }

        const isRefreshTokenInBlackList =
            await this.refreshTokenBlacklistService.hasToken(refreshToken)

        if (isRefreshTokenInBlackList) {
            throw new UnauthorizedException()
        }

        req['userId'] = data['userId']
        next()
    }
}
