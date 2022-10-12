import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Interest, InterestSchema } from 'src/shared/Schemas/interest.schema'
import { InterestController } from './Controller/interest.controller'
import { InterestService } from './Service/interest.service'
import {
    UserInterest,
    UserInterestSchema,
} from '../../../shared/Schemas/user-interest.schema'
import { UserInterestService } from './Service/user-interest.service'
import { InterestRepository } from './Repository/interest.repository'
import { UserInterestRepository } from './Repository/user-interest.repository'
import { UserInterestController } from './Controller/user-interest.controller'
import { UserInterestTransformer } from './Transformer/user-interest.transformer'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Interest.name, schema: InterestSchema },
            { name: UserInterest.name, schema: UserInterestSchema },
        ]),
    ],
    controllers: [InterestController, UserInterestController],
    providers: [
        UserInterestTransformer,
        InterestRepository,
        UserInterestRepository,
        InterestService,
        UserInterestService,
    ],
    exports: [
        InterestRepository,
        UserInterestRepository,
        UserInterestTransformer,
        InterestService,
        UserInterestService,
    ],
})
export class InterestsModule {}
