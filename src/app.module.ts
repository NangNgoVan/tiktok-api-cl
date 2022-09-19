import { Logger, Module } from '@nestjs/common'

import { MongooseModule } from '@nestjs/mongoose'

import { UIModule } from './ui/ui.module'
import { CMSModule } from './cms/cms.module'

import { configService } from './shared/Services/config.service'
import { HealthController } from './shared/Controllers/health.controller'
import { TerminusModule } from '@nestjs/terminus'
import { IndexController } from './shared/Controllers/index.controller'

@Module({
    imports: [
        UIModule,
        CMSModule,
        TerminusModule,
        // MongooseModule.forRoot(configService.getDbConnStr()),
    ],
    controllers: [IndexController, HealthController],
    providers: [Logger],
})
export class AppModule {}
