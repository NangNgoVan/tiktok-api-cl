import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { RedisNotConnectException } from '../Exceptions/redis-cache.exception'

@Catch(RedisNotConnectException)
export class RedisCacheExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    //Cache exception
  }
}
