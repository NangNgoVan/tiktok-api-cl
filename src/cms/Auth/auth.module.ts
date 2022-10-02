import { Module } from '@nestjs/common'
import { AuthController } from './Controller/auth.controller'
import { AuthService } from 'src/shared/Services/auth.service'
import { JwtService } from '@nestjs/jwt'
import { UsersModule } from 'src/ui/Users/users.module'
import { BlacklistService } from 'src/shared/Services/blacklist-redis.service'
import { RedisService } from 'src/shared/Services/redis.service'

@Module({
    imports: [UsersModule],
    controllers: [AuthController],
    providers: [AuthService, JwtService, BlacklistService, RedisService],
})
export class AuthModule {}
