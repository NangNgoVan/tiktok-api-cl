import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import IoRedis from 'ioredis'
import { useIoRedisAdapter } from 'type-cacheable'
import { RedisService } from './redis.service'

export enum CacheTtlSeconds {
    ONE_MINUTE = 60,
    ONE_HOUR = 60 * 60,
    ONE_DAY = 60 * 60 * 24,
    ONE_WEEK = 7 * 24 * 60 * 60,
}

@Injectable()
export class RedisCacheService implements OnModuleInit {
    private readonly logger: Logger = new Logger(RedisService.name)
    private redisIns: IoRedis | undefined

    public async onModuleInit() {
        try {
            const redisService = new RedisService()
            this.redisIns = redisService.getRedisInstance()
            this.redisIns.on('error', (e: Error) => {
                this.logger.log({ error: e })
            })
            useIoRedisAdapter(this.redisIns)
            await this.redisIns.connect()
        } catch (e) {
            this.logger.log({ error: e })
        }
    }
}
