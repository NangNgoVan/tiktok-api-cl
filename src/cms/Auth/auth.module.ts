import { Module } from '@nestjs/common'
import { AuthController } from './Controller/auth.controller'
import { AuthService } from 'src/shared/Services/auth.service'
import { JwtService } from '@nestjs/jwt'
import { UsersModule } from 'src/ui/Users/users.module'
import { BlacklistService } from 'src/shared/Services/blacklist-redis.service'
import { CacheService } from 'src/shared/Services/cache.service'

@Module({
    imports: [UsersModule],
    controllers: [AuthController],
    providers: [AuthService, JwtService, BlacklistService, CacheService],
})
export class AuthModule {}
