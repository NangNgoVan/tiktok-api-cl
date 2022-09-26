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

export class RefreshTokenInvalidException extends HttpException {
    constructor() {
        super('Refresh token invalid', HttpStatus.BAD_REQUEST)
    }
}

export class FeedNotFoundException extends HttpException {
    constructor() {
        super('Feed Not Found', HttpStatus.BAD_REQUEST)
    }
}

export class CommentNotFoundException extends HttpException {
    constructor() {
        super('Comment Not Found', HttpStatus.BAD_REQUEST)
    }
}

export class ForbidenException extends HttpException {
    constructor() {
        super('Forbidden', HttpStatus.FORBIDDEN)
    }
}
