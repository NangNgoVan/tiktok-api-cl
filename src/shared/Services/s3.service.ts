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
        hashKey: 'ui:s3:',
        cacheKey: (args: any[]) => `${args[1]}:${args[0]}`,
        noop: (args: any[]) => _.defaultTo(args[2], true),
        ttlSeconds: (args: any[]) => _.defaultTo(args[3], 10 * 60 * 60),
    })
    async getSignedUrl(
        objectKey: string,
        bucket: string,
        /* eslint-disable */
        disableCache?: boolean,
        cacheForSeconds?: number,
        /* eslint-enable */
    ): Promise<string | undefined> {
        const params = {
            Key: objectKey,
            Bucket: bucket,
            Expires: 12 * 60 * 60,
        }

        try {
            return this.s3().getSignedUrl('getObject', params)
        } catch (error) {
            this.logger.error({ message: 'get signed url', error, params })
        }

        return undefined
    }

    async getSignedUrls(
        objectKeys: string[],
        bucket: string,
        /* eslint-disable */
        disableCache?: boolean,
        cacheForSeconds?: number,
    ): Promise<Record<string, string | undefined>> {
        const ret: { objectKey: string; signedUrl: string | undefined }[] =
            await Promise.all(
                _.map(objectKeys, async (objectKey: string) => {
                    const signedUrl: string | undefined =
                        await this.getSignedUrl(
                            objectKey,
                            bucket,
                            disableCache,
                            cacheForSeconds,
                        )

                    return {
                        objectKey,
                        signedUrl,
                    }
                }),
            )

        return _.mapValues(_.keyBy(ret, 'objectKey'), 'signedUrl')
    }
}
