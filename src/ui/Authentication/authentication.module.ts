import { Module } from '@nestjs/common'
import { AuthenticationController } from './Controller/authentication.controller'
import { AuthenticationService } from 'src/ui/Authentication/Service/authentication.service'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { JwtStrategy } from 'src/shared/Strategies/jwt.strategy'
import { UsersModule } from '../Users/users.module'
import { BlacklistTokenService } from 'src/shared/Services/blacklist-token.service'
import { CacheService } from 'src/shared/Services/cache.service'

@Module({
    imports: [UsersModule, JwtModule.register({})],
    controllers: [AuthenticationController],
    providers: [
        AuthenticationService,
        JwtService,
        JwtStrategy,
        BlacklistTokenService,
        CacheService,
    ],
    exports: [AuthenticationService],
})
export class AuthenticationModule {}
