import { Module } from '@nestjs/common'
import { AuthenticationController } from './Controller/authentication.controller'
import { JwtService } from '@nestjs/jwt'
import { RefreshTokenBlacklistService } from 'src/shared/Services/refresh-token-blacklist.service'
import { CacheService } from 'src/shared/Services/cache.service'
import { AuthenticationService } from './Service/authentication.service'
import { UserAuthenticationMethodsRepository } from './Repository/user-authentication-methods.repository'
import { UsersRepository } from './Repository/users.repository'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from '../../shared/Schemas/user.schema'
import {
    UserAuthenticationMethod,
    UserAuthenticationMethodSchema,
} from '../../shared/Schemas/user-authentication-method.schema'

@Module({
    imports: [
        // FIXME: move this to users module
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            {
                name: UserAuthenticationMethod.name,
                schema: UserAuthenticationMethodSchema,
            },
        ]),
    ],
    controllers: [AuthenticationController],
    providers: [
        // FIXME: move this to users module
        // Repository
        UserAuthenticationMethodsRepository,
        UsersRepository,

        // Service
        JwtService,
        RefreshTokenBlacklistService,
        CacheService,
        AuthenticationService,
    ],
})
export class AuthenticationModule {}
