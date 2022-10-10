import { SetMetadata } from '@nestjs/common'

export const IsPublic = () => SetMetadata('is_public', true)
