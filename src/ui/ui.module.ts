import { Module } from '@nestjs/common'
import { AuthModule } from './Auth/auth.module'
import { UsersModule } from './Users/users.module'

@Module({
    imports: [AuthModule, UsersModule],
    controllers: [],
    providers: [],
})
export class UIModule {}
