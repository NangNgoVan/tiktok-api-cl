import { NestFactory } from '@nestjs/core'
import {
    DocumentBuilder,
    SwaggerDocumentOptions,
    SwaggerModule,
} from '@nestjs/swagger'

import { configService } from './shared/Services/config.service'

import { UIModule } from './ui/ui.module'
import { CMSModule } from './cms/cms.module'
import { AppModule } from './app.module'
import { WinstonModule } from 'nest-winston'
import CloudWatchTransport from 'winston-cloudwatch'
import * as winston from 'winston'
import moment from 'moment'
import * as AWS from 'aws-sdk'

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-southeast-1',
})

async function bootstrap() {
    const transports: winston.transport[] = []

    if (process.env.NODE_ENV !== 'local') {
        const cloudWatchTransport = new CloudWatchTransport({
            logGroupName:
                process.env.NODE_ENV === 'production'
                    ? 'prod-pav-api-application-log'
                    : 'dev-pav-api-application-log',
            logStreamName: () => {
                return moment().format('YYYY-MM-DD')
            },
        })

        transports.push(cloudWatchTransport)
    } else {
        transports.push(new winston.transports.Console())
    }

    const logger = WinstonModule.createLogger({
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
        ),
        transports,
    })

    const app = await NestFactory.create(AppModule, {
        logger,
    })

    // Swagger configuration
    const config = new DocumentBuilder()
        .setTitle('Tiktok APIs')
        .setDescription('Tiktok APIs')
        .setVersion('2.0')
        // .addTag('')
        .build()

    // Create Swagger doc for UI modules
    const uiApisDocOptions: SwaggerDocumentOptions = {
        include: [UIModule],
        deepScanRoutes: true,
    }
    const cmsApisDoc = SwaggerModule.createDocument(
        app,
        config,
        uiApisDocOptions,
    )
    SwaggerModule.setup('swagger-ui', app, cmsApisDoc)

    // Create Swagger doc for CMS modules
    const cmsApisDocOptions: SwaggerDocumentOptions = {
        include: [CMSModule],
        deepScanRoutes: true,
    }
    const uiApisDoc = SwaggerModule.createDocument(
        app,
        config,
        cmsApisDocOptions,
    )
    SwaggerModule.setup('swagger-cms', app, uiApisDoc)

    // Start application
    await app.listen(configService.getHostPort())
}

bootstrap()
