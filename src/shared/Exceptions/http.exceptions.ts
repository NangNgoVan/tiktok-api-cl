import { HttpException, HttpStatus } from '@nestjs/common'

export class UserNotFoundException extends HttpException {
    constructor() {
        super('Users not found', HttpStatus.NOT_FOUND)
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

export class CreatedOnlyReactionException extends HttpException {
    constructor() {
        super('Users has created only reaction!', HttpStatus.BAD_REQUEST)
    }
}

export class ForbidenException extends HttpException {
    constructor() {
        super('Forbidden', HttpStatus.FORBIDDEN)
    }
}
