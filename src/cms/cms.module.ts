import { Module } from '@nestjs/common'
import { AuthenticationModule } from './Authentication/authentication.module'

@Module({
    imports: [AuthenticationModule],
    controllers: [],
    providers: [],
})
export class CMSModule {}
