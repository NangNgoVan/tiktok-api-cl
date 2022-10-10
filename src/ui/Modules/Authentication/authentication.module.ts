import { Module } from '@nestjs/common'
import { AuthenticationController } from './Controller/authentication.controller'
import { AuthenticationService } from 'src/ui/Modules/Authentication/Service/authentication.service'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { JwtStrategy } from 'src/shared/Strategies/jwt.strategy'
import { UsersModule } from '../Users/users.module'
import { RefreshTokenBlacklistService } from 'src/shared/Services/refresh-token-blacklist.service'
import { CacheService } from 'src/shared/Services/cache.service'

@Module({
    imports: [UsersModule, JwtModule.register({})],
    controllers: [AuthenticationController],
    providers: [
        AuthenticationService,
        JwtService,
        JwtStrategy,
        RefreshTokenBlacklistService,
        CacheService,
    ],
    exports: [AuthenticationService, JwtService, RefreshTokenBlacklistService],
})
export class AuthenticationModule {}
