import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { UserAuthenticationMethodsController } from './user-authentication-methods.controller'

describe('UserAuthenticationMethodsController', () => {
    let controller: UserAuthenticationMethodsController

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
        }).compile()

        controller = module.get<UserAuthenticationMethodsController>(
            UserAuthenticationMethodsController,
        )
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })
})
