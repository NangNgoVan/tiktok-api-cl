import { Module } from '@nestjs/common'
import { AuthController } from './Controller/auth.controller'
import { AuthService } from 'src/shared/Services/auth.service'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { JwtStrategy } from 'src/shared/Strategies/jwt.strategy'
import { UsersModule } from '../Users/users.module'
import { BlacklistService } from 'src/shared/Services/blacklist-redis.service'
import { CacheService } from 'src/shared/Services/cache.service'

@Module({
    imports: [UsersModule, JwtModule.register({})],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtService,
        JwtStrategy,
        BlacklistService,
        CacheService,
    ],
})
export class AuthModule {}
