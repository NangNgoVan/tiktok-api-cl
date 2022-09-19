import { ConsoleLogger, Injectable, Inject, ServiceUnavailableException } from '@nestjs/common'
import Ioredis from 'ioredis'
import { configService } from "./config.service"

export enum CacheTtlSeconds {
    ONE_MINUTE = 60,
    ONE_HOUR = 60 * 60,
    ONE_DAY = 60 * 60 * 24,
    ONE_WEEK = 7 * 24 * 60 * 60,
}

import * as CacheManager from 'cache-manager'
import * as RedisStore from 'cache-manager-redis'

import { CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';


@Injectable()
export class RedisCacheService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager) {
        const client = cacheManager.store.getClient();
        client.on('error', (error) => {
            //throw new ServiceUnavailableException;
            console.log(error)
        });
    }

    async set(key: string, value: string, expireTime?: number) {
        if (expireTime) {
            this.cacheManager.set(key, value, {ttl: expireTime}, (err) => {
                if (err) {
                    console.log('error');
                }
            })
        } else {
            this.cacheManager.set(key, value, err => {
                if (err) {
                    console.log('error 2');
                }
            })
        }
    }

    async get(key: string) {
        this.cacheManager.get(key, (err, result) => {
            if (err) return undefined;
            return result;
        });
    }


    async del(key: string) {
        return this.cacheManager.del(key)
    }
}
