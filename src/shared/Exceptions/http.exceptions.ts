import { HttpException, HttpStatus } from '@nestjs/common'

export class UserNotFoundException extends HttpException {
    constructor() {
        super('User not found', HttpStatus.NOT_FOUND)
    }
}

export class FileUploadFailException extends HttpException {
    constructor() {
        super('File upload failed', HttpStatus.BAD_REQUEST)
    }
}

export class DatabaseUpdateFailException extends HttpException {
    constructor() {
        super('Updating process to DB failed!', HttpStatus.BAD_REQUEST)
    }
}
