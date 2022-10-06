import { Inject, Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { configService } from './config.service'
import { CacheService } from './cache.service'

@Injectable()
export class BlacklistTokenService {
    private readonly logger: Logger = new Logger(BlacklistTokenService.name)
    private prefixKey = 'blacklist-key-'
    constructor(
        @Inject(CacheService)
        private readonly cacheService: CacheService,
        private readonly jwtService: JwtService,
    ) {}
    async addTokenToBlacklist(value: string): Promise<boolean> {
        try {
            const verify = this.jwtService.verify(value, {
                secret: configService.getEnv('JWT_REFRESH_TOKEN_SECRET'),
            })
            if (verify) {
                const exp = verify.exp
                const key = this.prefixKey + value
                await this.cacheService.set(key, value, exp)
                return true
            }
        } catch (error) {
            this.logger.error({ error })
            return false
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
