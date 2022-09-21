import { Module } from '@nestjs/common'

import { AuthModule } from './Auth/auth.module'
import { UserModule } from './Users/users.module'

@Module({
    imports: [AuthModule, UserModule],
    controllers: [],
    providers: [],
})
export class UIModule {}
