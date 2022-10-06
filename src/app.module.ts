import { Logger, Module, OnModuleInit } from '@nestjs/common'

import { MongooseModule } from '@nestjs/mongoose'

import { UIModule } from './ui/ui.module'
import { CMSModule } from './cms/cms.module'

import { configService } from './shared/Services/config.service'
import { HealthController } from './shared/Controllers/health.controller'
import { TerminusModule } from '@nestjs/terminus'
import { IndexController } from './shared/Controllers/index.controller'
import MongoPaging from 'mongo-cursor-pagination'
import IoRedis from 'ioredis'
import { useAdapter } from '@type-cacheable/ioredis-adapter'

@Module({
    imports: [
        UIModule,
        CMSModule,
        TerminusModule,
        MongooseModule.forRoot(configService.getDbConnStr(), {
            connectionFactory: (connection) => {
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
export class AppModule implements OnModuleInit {
    onModuleInit() {
        const client = new IoRedis({
            host: configService.getEnv('REDIS_HOST'),
            port: configService.getEnv('REDIS_PORT'),
        })

        useAdapter(client)
    }
}
