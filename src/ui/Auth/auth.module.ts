import { Module } from '@nestjs/common'
import { AuthController } from './Controller/auth.controller'
import { AuthService } from 'src/shared/Services/auth.service'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { JwtStrategy } from 'src/shared/Strategies/jwt.strategy'
import { UsersModule } from '../Users/users.module'
import { BlacklistTokenService } from 'src/shared/Services/blacklist-token.service'
import { CacheService } from 'src/shared/Services/cache.service'

@Module({
    imports: [UsersModule, JwtModule.register({})],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtService,
        JwtStrategy,
        BlacklistTokenService,
        CacheService,
    ],
})
export class AuthModule {}
