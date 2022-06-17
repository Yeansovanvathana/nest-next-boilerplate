import { Test, TestingModule } from '@nestjs/testing'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { RedisService } from '@liaoliaots/nestjs-redis'
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm'

import { AuthController } from '../auth.controller'
import { AuthService } from '../auth.service'
import { UserModule } from '../../user/user.module'
import { User } from '../../../../common/entities'
import { createJwtConfiguration, createTestConfiguration } from '../../../../../test/test-utils'
import { UserRepository } from '../../user/repositories/user.repository'
import { BullModule } from '@nestjs/bull'

describe('AuthController', () => {
    let module: TestingModule
    let controller: AuthController
    let service: AuthService
    let repository: UserRepository

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true
                }),
                UserModule,
                TypeOrmModule.forRootAsync(createTestConfiguration([User])),
                TypeOrmModule.forFeature([User]),
                JwtModule.registerAsync(createJwtConfiguration()),
                BullModule.registerQueue({
                    name: 'mail-queue',
                    redis: {
                        host: 'localhost',
                        port: 6379
                    }
                })
            ],
            controllers: [AuthController],
            providers: [
                AuthService,
                {
                    provide: RedisService,
                    useValue: {
                      get: jest.fn(),
                      getClient: jest.fn().mockReturnValue({}),
                    }
                }
            ]
        }).compile()
        controller = module.get<AuthController>(AuthController)
        service = module.get<AuthService>(AuthService)
        repository = module.get<UserRepository>(getRepositoryToken(User))
        repository.clear()
    })

    afterAll(async () => {
        repository.clear()
        module.close()
    })

    it('Should be defined', () => {
        expect(module).toBeDefined()
    })

    it('Should be defined', () => {
        expect(controller).toBeDefined()
    })

    it('Should be defined', () => {
        expect(service).toBeDefined()
    })
})
