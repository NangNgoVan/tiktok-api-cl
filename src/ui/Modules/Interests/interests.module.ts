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

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Interest.name, schema: InterestSchema },
            { name: UserInterest.name, schema: UserInterestSchema },
        ]),
    ],
    controllers: [InterestController],
    providers: [
        InterestRepository,
        UserInterestRepository,
        InterestService,
        UserInterestService,
    ],
    exports: [
        InterestService,
        UserInterestService,
        InterestRepository,
        UserInterestRepository,
    ],
})
export class InterestsModule {}
