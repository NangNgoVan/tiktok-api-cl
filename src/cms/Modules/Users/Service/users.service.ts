import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { GetUserResponseDto } from '../ResponseDTO/get-user-response.dto'
import _ from 'lodash'
import { RolesService } from './roles.service'
import { UsersRepository } from '../Repository/users.repository'
import bcrypt from 'bcrypt'
import { AuthenticationMethod } from '../../../../shared/Types/types'
import { UserAuthenticationMethodsRepository } from '../Repository/user-authentication-methods.repository'
import { v4 as uuidv4 } from 'uuid'
import { CreateUserWithAuthenticationMethodCredentialRequestDto } from '../RequestDTO/create-user-with-authentication-method-credential-request.dto'
import { S3Service } from '../../../../shared/Services/s3.service'
import { configService } from '../../../../shared/Services/config.service'

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly userAuthenticationMethodRepository: UserAuthenticationMethodsRepository,
        private readonly rolesService: RolesService,
        private readonly s3Service: S3Service,
    ) {}

    async getById(id: string): Promise<GetUserResponseDto> {
        const userDocument = await this.usersRepository.getById(id)

        if (!userDocument) {
            throw new NotFoundException(`User ${id} not found`)
        }

        const roles: string[] = _.get(userDocument, 'roles', [])

        const effectivePermissions: string[] =
            await this.rolesService.getEffectivePermissionsByRoles(roles)

        const avatar: string = await this.s3Service.getSignedUrl(
            userDocument.avatar,
            configService.getEnv('AWS_BUCKET_NAME'),
            false,
        )

        return {
            ...userDocument.toObject(),
            permissions: effectivePermissions,
            avatar,
        }
    }

    async createWithAuthenticationMethodCredential(
        createUserWithAuthenticationMethodCredentialRequestDto: CreateUserWithAuthenticationMethodCredentialRequestDto,
    ) {
        const { username, password, password_confirmation } =
            createUserWithAuthenticationMethodCredentialRequestDto

        if (password !== password_confirmation) {
            throw new BadRequestException(
                'Password confirmation does not match',
            )
        }

        const authenticationMethod =
            await this.userAuthenticationMethodRepository.findByUsername(
                username,
            )

        if (authenticationMethod) {
            throw new BadRequestException(`Username ${username} already exists`)
        }

        const uuidNoHyphens = uuidv4().replace(/-/g, '')

        const user = await this.usersRepository.create({
            full_name: `user ${uuidNoHyphens}`,
            nick_name: `user${uuidNoHyphens}`,
            is_trial_user: false,
        })

        const salt = await bcrypt.genSalt(10)
        const hashed = await bcrypt.hash(password, salt)

        await this.userAuthenticationMethodRepository.createAuthenticationMethod(
            {
                authentication_method: AuthenticationMethod.CREDENTIAL,
                data: {
                    username,
                    password: hashed,
                },
                user_id: user.id,
            },
        )

        return this.getById(user.id)
    }
}