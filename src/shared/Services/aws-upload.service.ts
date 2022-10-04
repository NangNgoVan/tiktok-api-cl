import { Injectable, NotFoundException } from '@nestjs/common'
import * as aws from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid'
import { FileUploadFailException } from '../Exceptions/http.exceptions'
import { configService } from './config.service'

@Injectable()
export class AWS3FileUploadService {
    s3() {
        return new aws.S3(configService.AWS3Configuration())
    }

    async uploadFileToS3Bucket(key, mimeType, buffer) {
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
        } catch (e) {
            return null
        }
    }
}
