import { Logger } from '@nestjs/common'
import cacheManager from '@type-cacheable/core'

export class RedisService {
    private readonly logger: Logger = new Logger(RedisService.name)

    async set(key: string, value: string, ttl?: number) {
        try {
            await cacheManager.client?.set(key, value, ttl)
        } catch (error) {
            this.logger.error({ error })
        }
    }

    async get(key: string) {
        try {
            return await cacheManager.client?.get(key)
        } catch (error) {
            this.logger.error({ error })
            return undefined
        }
    }

    async del(key: string | string[]) {
        try {
            return await cacheManager.client?.del(key)
        } catch (error) {
            this.logger.error({ error })
        }
    }
}
