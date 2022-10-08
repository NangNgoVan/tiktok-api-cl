import { Module } from '@nestjs/common'
import { AuthenticationController } from './Controller/authentication.controller'
import { JwtService } from '@nestjs/jwt'
import { UsersModule } from 'src/ui/Users/users.module'
import { BlacklistTokenService } from 'src/shared/Services/blacklist-token.service'
import { CacheService } from 'src/shared/Services/cache.service'

@Module({
    imports: [UsersModule],
    controllers: [AuthenticationController],
    providers: [JwtService, BlacklistTokenService, CacheService],
})
export class AuthenticationModule {}
