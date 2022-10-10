import { Module } from '@nestjs/common'
import { UsersController } from './Controller/users.controller'
import { JwtService } from '@nestjs/jwt'
import { RefreshTokenBlacklistService } from 'src/shared/Services/refresh-token-blacklist.service'
import { CacheService } from 'src/shared/Services/cache.service'
import { AuthenticationService } from './Service/authentication.service'

@Module({
    imports: [],
    controllers: [UsersController],
    providers: [
        // Service
        JwtService,
        RefreshTokenBlacklistService,
        CacheService,
        AuthenticationService,
    ],
    exports: [
        // JwtService, RefreshTokenBlacklistService, CacheService
    ],
})
export class AuthenticationModule {}
