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
    async uploadFileToS3Bucket(
        file,
        bucket,
        name,
        mimeType,
        ownerId,
        subfolderPath,
    ) {
        const userFolder = `${subfolderPath}/${ownerId}`
        const ext = name.split('.')[1]
        const uploadParams = {
            Bucket: bucket,
            Key: `${userFolder}/${uuidv4()}.${ext}`,
            Body: file,
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
