import { Module } from '@nestjs/common'

import { AuthModule } from './Auth/auth.module'

@Module({
    imports: [AuthModule],
    controllers: [],
    providers: [],
})
export class UIModule {}
