// Other dependencies
import { Logger } from '@nestjs/common'
import IoRedis from 'ioredis'

// Local files
import { configService } from './config.service'

export class RedisService {
    private readonly logger: Logger = new Logger(RedisService.name)

    private redisConnection() {
        return new IoRedis({
            host: configService.getEnv('REDIS_HOST'),
            port: configService.getEnv('REDIS_PORT'),
            /*password: configService.getEnv('REDIS_PASSWORD'),*/
        })
    }

    public getRedisInstance() {
        return this.redisConnection()
    }

    async set(key: string, value: string, expireTime?: number) {
        try {
            if (expireTime) {
                await this.redisConnection().set(key, value, 'EX', expireTime)
            } else {
                await this.redisConnection().set(key, value)
            }
        } catch (e) {
            this.logger.log({ error: e })
        }
    }

    async setOnlyKey(key: string, expireTime?: number) {
        try {
            if (expireTime) {
                await this.redisConnection().set(key, null, 'EX', expireTime)
            } else {
                await this.redisConnection().set(key, null)
            }
        } catch (e) {
            this.logger.log({ error: e })
        }
    }

    async get(key: string) {
        try {
            return await this.redisConnection().get(key)
        } catch (e) {
            this.logger.log({ error: e })
            return null
        }
    }

    async del(key: string) {
        try {
            await this.redisConnection().del(key)
        } catch (e) {
            this.logger.log({ error: e })
        }
    }
}
