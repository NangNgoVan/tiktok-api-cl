import { HttpException, HttpStatus } from '@nestjs/common'

export class RedisNotConnectException extends HttpException {
  constructor() {
    super('RedisNotConnectException', HttpStatus.BAD_REQUEST)
  }
}
