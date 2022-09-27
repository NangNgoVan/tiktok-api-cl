import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthenticationMethodsController } from './authentication-methods.controller'

describe('AuthenticationMethodsController', () => {
    let controller: AuthenticationMethodsController

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
        }).compile()

        controller = module.get<AuthenticationMethodsController>(
            AuthenticationMethodsController,
        )
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })
})
