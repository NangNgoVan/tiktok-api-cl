// Other dependencies
import IoRedis from 'ioredis'

// Local files
import { configService } from './config.service'

export class RedisService {
    private redisConnection() {
        return new IoRedis({
            host: configService.getEnv('REDIS_HOST'),
            port: configService.getEnv('REDIS_PORT'),
            /*password: configService.getEnv('REDIS_PASSWORD'),*/
        })
    }

    async set(key: string, value: string, expireTime?: number) {
        if (expireTime) {
            await this.redisConnection().set(key, value, 'EX', expireTime)
        } else {
            await this.redisConnection().set(key, value)
        }
    }

    async setOnlyKey(key: string, expireTime?: number) {
        if (expireTime) {
            await this.redisConnection().set(key, null, 'EX', expireTime)
        } else {
            await this.redisConnection().set(key, null)
        }
    }

    async get(key: string) {
        return await this.redisConnection().get(key)
    }

    async del(key: string) {
        await this.redisConnection().del(key)
    }
}
