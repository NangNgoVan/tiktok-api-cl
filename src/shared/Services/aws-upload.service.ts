import { Injectable, Logger } from '@nestjs/common'
import * as aws from 'aws-sdk'
import { configService } from './config.service'

@Injectable()
export class AWS3FileUploadService {
    private readonly logger: Logger = new Logger(AWS3FileUploadService.name)

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
        //
        try {
            const uploadData = await this.s3().upload(uploadParams).promise()
            return uploadData
        } catch (error) {
            this.logger.error({
                error,
            })

            return null
        }
    }
}
