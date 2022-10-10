import { Module } from '@nestjs/common'
import { AuthenticationController } from './Controller/authentication.controller'
import { JwtService } from '@nestjs/jwt'
import { RefreshTokenBlacklistService } from 'src/shared/Services/refresh-token-blacklist.service'
import { CacheService } from 'src/shared/Services/cache.service'
import { AuthenticationService } from './Service/authentication.service'

@Module({
    imports: [],
    controllers: [AuthenticationController],
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
