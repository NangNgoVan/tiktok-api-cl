import { Injectable, Logger } from '@nestjs/common'
import * as aws from 'aws-sdk'
import { configService } from './config.service'
import _ from 'lodash'
import { Cacheable } from '@type-cacheable/core'

@Injectable()
export class S3Service {
    private readonly logger: Logger = new Logger(S3Service.name)

    s3() {
        return new aws.S3(configService.AWS3Configuration())
    }

    async uploadFileToS3Bucket(key: string, mimeType: string, buffer: Buffer) {
        const uploadParams = {
            Bucket: configService.getEnv('AWS_BUCKET_NAME'),
            Key: key,
            Body: buffer,
            ContentType: mimeType,
            ContentDisposition: 'inline',
            CreateBucketConfiguration: {
                LocationConstraint: configService.getEnv('AWS_REGION'),
            },
        }

        try {
            return await this.s3().upload(uploadParams).promise()
        } catch (error) {
            this.logger.error({
                error,
            })

            return null
        }
    }

    @Cacheable({
        hashKey: 'a-hash',
        cacheKey: (args: any[]) => `ui:s3:${args[1]}:${args[0]}`,
        noop: (args: any[]) => args[2] as boolean,
        ttlSeconds: (args: any[]) => args[3] as number,
    })
    async getSignedUrl(
        objectKey: string,
        bucket: string,
        /* eslint-disable */
        disableCache = true,
        cacheForSeconds = 180,
        /* eslint-enable */
    ) {
        const params = { Key: objectKey, Bucket: bucket, Expires: 2 * 60 }
        return this.s3().getSignedUrl('getObject', params)
    }

    async getSignedUrls(objectKeys: string[], bucket: string) {
        return Promise.all(
            _.map(objectKeys, (objectKey) =>
                this.getSignedUrl(objectKey, bucket),
            ),
        )
    }
}
