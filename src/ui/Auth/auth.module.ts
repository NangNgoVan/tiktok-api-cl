import { Module } from '@nestjs/common'
import { AuthController } from './Controller/auth.controller'

import { AuthService } from 'src/shared/Services/auth.service'
import { JwtService } from '@nestjs/jwt'

import { RedisCacheService } from 'src/shared/Services/redis-cache.service'

@Module({
  imports: [  
    
  ],
  controllers: [ AuthController ],
  providers: [ AuthService, JwtService, RedisCacheService],
})
export class AuthModule {}
