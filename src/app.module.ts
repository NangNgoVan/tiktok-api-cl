import {
    Logger,
    MiddlewareConsumer,
    Module,
    NestModule,
    RequestMethod,
} from '@nestjs/common'

import { MongooseModule } from '@nestjs/mongoose'

import { UIModule } from './ui/ui.module'
import { CMSModule } from './cms/cms.module'

import { configService } from './shared/Services/config.service'
import { HealthController } from './shared/Controllers/health.controller'
import { TerminusModule } from '@nestjs/terminus'
import { IndexController } from './shared/Controllers/index.controller'
import { AuthenticationController } from './ui/Auth/Controller/authentication.controller'
import MongoPaging from 'mongo-cursor-pagination'

@Module({
    imports: [
        UIModule,
        CMSModule,
        TerminusModule,
        MongooseModule.forRoot(configService.getDbConnStr(), {
            connectionFactory: (connection) => {
                //const MongoPaging = require('mongo-cursor-pagination')
                connection.plugin(MongoPaging.mongoosePlugin, {
                    name: 'paginate',
                })
                return connection
            },
        }),
    ],
    controllers: [IndexController, HealthController],
    providers: [Logger],
})
export class AppModule {}
