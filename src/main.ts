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
import winston from 'winston'
import moment from 'moment'
import morgan from 'morgan'
import rTracer from 'cls-rtracer'

const createLogger = (logGroupName: string) => {
    const transports: winston.transport[] = []

    if (process.env.NODE_ENV === 'local') {
        transports.push(new winston.transports.Console())
    } else {
        const cloudWatchTransport = new CloudWatchTransport({
            logGroupName,
            logStreamName: () => {
                return moment().format('YYYY-MM-DD')
            },
            awsRegion: 'ap-southeast-1',
            awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
            awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
            jsonMessage: true,
        })

        transports.push(cloudWatchTransport)
    }

    const requestIdFormatter = winston.format((info) => {
        info.requestId = rTracer.id()
        return info
    })

    return WinstonModule.createLogger({
        format: winston.format.combine(
            requestIdFormatter(),
            winston.format.timestamp(),
            winston.format.json(),
        ),
        transports,
    })
}

async function bootstrap() {
    const applicationLogger = createLogger(
        process.env.NODE_ENV !== 'production'
            ? 'dev-pav-api-application-log'
            : 'prod-pav-api-application-log',
    )

    const app = await NestFactory.create(AppModule, {
        logger: applicationLogger,
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

    // Request logs
    const accessLogger = createLogger(
        process.env.NODE_ENV !== 'production'
            ? 'dev-pav-api-access-log'
            : 'prod-pav-api-access-log',
    )
    app.use(
        morgan('combined', {
            stream: {
                write: function (message) {
                    accessLogger.log(message)
                },
            },
        }),
    )

    // Tracer
    app.use(rTracer.expressMiddleware())

    // Starts listening for shutdown hooks
    app.enableShutdownHooks()

    // Start application
    await app.listen(configService.getHostPort())
}

bootstrap()
