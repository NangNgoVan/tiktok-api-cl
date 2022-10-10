import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { UserData } from '../Types/types'

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest()

        return request.user as UserData
    },
)
