import { Inject, Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { configService } from './config.service'
import { CacheService } from './cache.service'

@Injectable()
export class RefreshTokenBlacklistService {
    private readonly logger: Logger = new Logger(
        RefreshTokenBlacklistService.name,
    )
    private prefixKey = 'refresh-token-blacklist-'
    constructor(
        @Inject(CacheService)
        private readonly cacheService: CacheService,
        private readonly jwtService: JwtService,
    ) {}

    async addRefreshTokenToBlacklist(value: string): Promise<void> {
        try {
            const verify = this.jwtService.verify(value, {
                secret: configService.getEnv('JWT_REFRESH_TOKEN_SECRET'),
            })

            if (verify) {
                const exp = verify.exp
                const key = this.prefixKey + value
                await this.cacheService.set(key, value, exp)
            }
        } catch (error) {
            this.logger.error({ error })
        }
    }

    async hasToken(value: string) {
        try {
            const key = this.prefixKey + value
            const token = await this.cacheService.get(key)
            return !!token
        } catch (error) {
            this.logger.error({ error })
            return false
        }
    }
}
