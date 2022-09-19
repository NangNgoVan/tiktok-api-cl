import {
  ConsoleLogger,
  Injectable,
  Inject,
  ServiceUnavailableException,
  UseFilters,
} from '@nestjs/common'
import Ioredis from 'ioredis'
import { configService } from './config.service'

export enum CacheTtlSeconds {
  ONE_MINUTE = 60,
  ONE_HOUR = 60 * 60,
  ONE_DAY = 60 * 60 * 24,
  ONE_WEEK = 7 * 24 * 60 * 60,
}

import { CACHE_MANAGER } from '@nestjs/common'
import { Cache } from 'cache-manager'

@Injectable()
export class RedisCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager) {
    const client = cacheManager.store.getClient()
    client.on('error', (error) => {
      // handle error
    })
  }

  async set(key: string, value: string, expireTime?: number) {
    if (!expireTime) expireTime = 5000
    this.cacheManager.set(key, value, { ttl: expireTime }, (err) => {
      if (err) {
        console.log('error')
      }
    })
  }

  async get(key: string) {
    return await this.cacheManager.get(key)
  }

  async del(key: string) {
    return await this.cacheManager.del(key)
  }
}
