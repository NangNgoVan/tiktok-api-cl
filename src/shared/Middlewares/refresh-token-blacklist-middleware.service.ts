import {
    Injectable,
    NestMiddleware,
    UnauthorizedException,
    Request,
    Response,
    Logger,
} from '@nestjs/common'
import { NextFunction } from 'express'
import { RefreshTokenBlacklistService } from '../Services/refresh-token-blacklist.service'
import { configService } from '../Services/config.service'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class RefreshTokenBlacklistMiddleware implements NestMiddleware {
    private readonly logger: Logger = new Logger(
        RefreshTokenBlacklistMiddleware.name,
    )

    constructor(
        private readonly refreshTokenBlacklistService: RefreshTokenBlacklistService,
        private readonly jwtService: JwtService,
    ) {}

    async use(req: Request, res: Response, next: NextFunction) {
        const refreshToken = req.headers['refresh-token']

        if (!refreshToken) {
            throw new UnauthorizedException()
        }

        let data

        try {
            data = this.jwtService.verify(refreshToken, {
                secret: configService.getEnv('JWT_REFRESH_TOKEN_SECRET'),
            })
        } catch (error) {
            this.logger.error({
                error,
            })
        }

        if (!data) {
            throw new UnauthorizedException()
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
