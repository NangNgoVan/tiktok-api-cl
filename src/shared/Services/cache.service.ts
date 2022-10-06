import { Logger } from '@nestjs/common'
import cacheManager from '@type-cacheable/core'

export class CacheService {
    private readonly logger: Logger = new Logger(CacheService.name)

    async set(key: string, value: string, ttl?: number): Promise<void> {
        try {
            await cacheManager.client?.set(key, value, ttl)
        } catch (error) {
            this.logger.error({ error })
        }
    }

    async get<T>(key: string): Promise<T | undefined> {
        try {
            return await cacheManager.client?.get(key)
        } catch (error) {
            this.logger.error({ error })
            return undefined
        }
    }

    async del(key: string | string[]): Promise<void> {
        try {
            await cacheManager.client?.del(key)
        } catch (error) {
            this.logger.error({ error })
        }
    }

    async delHash(hashKeyOrKeys: string | string[]): Promise<void> {
        try {
            await cacheManager.client?.delHash(hashKeyOrKeys)
        } catch (error) {
            this.logger.error({ error })
        }
    }

    async keys(pattern: string): Promise<string[]> {
        try {
            return await cacheManager.client?.keys(pattern)
        } catch (error) {
            this.logger.error({ error })
            return []
        }
    }
}
