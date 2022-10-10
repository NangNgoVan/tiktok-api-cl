import { forwardRef, Module } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { RefreshTokenBlacklistService } from 'src/shared/Services/refresh-token-blacklist.service'
import { CacheService } from 'src/shared/Services/cache.service'
import { AuthenticationService } from './Service/authentication.service'
import { AuthenticationController } from './Controller/authentication.controller'
import { UsersModule } from '../Users/users.module'

@Module({
    imports: [forwardRef(() => UsersModule)],
    controllers: [AuthenticationController],
    providers: [
        JwtService,
        RefreshTokenBlacklistService,
        CacheService,
        AuthenticationService,
    ],
    exports: [JwtService, RefreshTokenBlacklistService],
})
export class AuthenticationModule {}
