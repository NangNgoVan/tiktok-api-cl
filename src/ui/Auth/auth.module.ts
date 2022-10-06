import { Module } from '@nestjs/common'
import { AuthenticationController } from './Controller/authentication.controller'
import { AuthService } from 'src/shared/Services/auth.service'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { JwtStrategy } from 'src/shared/Strategies/jwt.strategy'
import { UsersModule } from '../Users/users.module'
import { BlacklistService } from 'src/shared/Services/blacklist-redis.service'
import { RedisService } from 'src/shared/Services/redis.service'

@Module({
    imports: [UsersModule, JwtModule.register({})],
    controllers: [AuthenticationController],
    providers: [
        AuthService,
        JwtService,
        JwtStrategy,
        BlacklistService,
        RedisService,
    ],
    exports: [AuthService],
})
export class AuthModule {}
