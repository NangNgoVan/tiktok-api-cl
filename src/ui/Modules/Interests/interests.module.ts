import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Interest, InterestSchema } from 'src/shared/Schemas/interest.schema'
import { InterestsController } from './Controller/interests.controller'
import { InterestsService } from './Service/interests.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Interest.name, schema: InterestSchema },
        ]),
    ],
    controllers: [InterestsController],
    providers: [InterestsService],
    exports: [InterestsService],
})
export class InterestsModule {}
