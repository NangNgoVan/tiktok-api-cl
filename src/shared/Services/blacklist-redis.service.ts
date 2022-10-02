import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { configService } from './config.service'
import { RedisService } from './redis.service'

@Injectable()
export class BlacklistService {
    private prefixKey = 'blacklist-key-'
    constructor(
        @Inject(RedisService)
        private readonly redisService: RedisService,
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
                await this.redisService.set(key, value, exp)
                return true
            }
        } catch {
            return false
        }
    }
    //async removeJwtToken(value: string) {}
    async getJwtToken(value: string) {
        try {
            const key = this.prefixKey + value
            const token = await this.redisService.get(key)
            if (token) return true
            return false
        } catch {
            return false
        }
    }
}
