import { Module } from '@nestjs/common'
import { AuthModule } from './Auth/auth.module'
import { UsersModule } from './Users/users.module'
import { InterestsModule } from './interests/interests.module'
import { FeedsModule } from './feeds/feeds.module'

@Module({
    imports: [AuthModule, UsersModule, InterestsModule, FeedsModule],
    controllers: [],
    providers: [],
})
export class UIModule {}
