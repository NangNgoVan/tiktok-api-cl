import { Inject, Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { configService } from './config.service'
import { CacheService } from './cache.service'

@Injectable()
export class BlacklistService {
    private readonly logger: Logger = new Logger(BlacklistService.name)
    private prefixKey = 'blacklist-key-'
    constructor(
        @Inject(CacheService)
        private readonly cacheService: CacheService,
        private readonly jwtService: JwtService,
    ) {}
    async addJwtToken(value: string): Promise<boolean> {
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
        } catch (e) {
            this.logger.log({ error: e })
            return false
        }
    }
    //async removeJwtToken(value: string) {}
    async getJwtToken(value: string) {
        try {
            const key = this.prefixKey + value
            const token = await this.cacheService.get(key)
            if (token) return true
            return false
        } catch (e) {
            this.logger.log({ error: e })
            return false
        }
    }
}
