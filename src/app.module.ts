import { Module } from '@nestjs/common'

import { MongooseModule } from '@nestjs/mongoose'

import { UIModule } from './ui/ui.module'
import { CMSModule } from './cms/cms.module'

import { configService } from './shared/Services/config.service'
import { RedisCacheService } from './shared/Services/redis-cache.service'

import { CacheModule } from '@nestjs/common'
import * as redisStore from 'cache-manager-redis-store'

@Module({
  imports: [
    UIModule,
    CMSModule,
    MongooseModule.forRoot(configService.getDbConnStr()),
    CacheModule.register({
      store: redisStore,
      host: configService.getEnv('REDIS_HOST'),
      port: configService.getEnv('REDIS_PORT'),
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [RedisCacheService],
})
export class AppModule {}
