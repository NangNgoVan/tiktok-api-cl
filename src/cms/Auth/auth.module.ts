import { Module } from '@nestjs/common'
import { AuthController } from './Controller/auth.controller'
import { AuthService } from 'src/shared/Services/auth.service'
import { JwtService } from '@nestjs/jwt'
import { UsersModule } from 'src/ui/Users/users.module'

@Module({
    imports: [UsersModule],
    controllers: [AuthController],
    providers: [AuthService, JwtService],
})
export class AuthModule {}
