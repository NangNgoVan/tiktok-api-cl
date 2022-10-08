import { Module } from '@nestjs/common'
import { AuthController } from './Controller/auth.controller'
import { AuthenticationService } from 'src/ui/Authentication/Service/authentication.service'
import { JwtService } from '@nestjs/jwt'
import { UsersModule } from 'src/ui/Users/users.module'
import { BlacklistTokenService } from 'src/shared/Services/blacklist-token.service'
import { CacheService } from 'src/shared/Services/cache.service'

@Module({
    imports: [UsersModule],
    controllers: [AuthController],
    providers: [
        AuthenticationService,
        JwtService,
        BlacklistTokenService,
        CacheService,
    ],
})
export class AuthModule {}
