import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Subject } from 'rxjs'
import { Action } from 'rxjs/internal/scheduler/Action'
import { ActionSchema } from 'src/shared/Schemas/action.schema'
import { Role, RoleSchema } from 'src/shared/Schemas/role.schema'
import {
    StickerPackage,
    StickerPackageSchema,
} from 'src/shared/Schemas/sticker-package.schema'
import { SubjectSchema } from 'src/shared/Schemas/subject.schema'
import { S3Service } from 'src/shared/Services/s3.service'
import { ActionsRepository } from '../Users/Repository/actions.repository'
import { SubjectsRepository } from '../Users/Repository/subjects.repository'
import { PermissionsService } from '../Users/Service/permissions.service'
import { StickerPackagesController } from './Controller/sticker-packages.controller'
import { StickerPackagesRepository } from './Repository/sticker-packages.repository'
import { StickerPackagesService } from './Service/sticker-packages.service'
import { StickerPackageModelTransform } from './Transformer/sticker-package-model.transform'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Subject.name,
                schema: SubjectSchema,
            },
            {
                name: Action.name,
                schema: ActionSchema,
            },
            {
                name: Role.name,
                schema: RoleSchema,
            },
            {
                name: StickerPackage.name,
                schema: StickerPackageSchema,
            },
        ]),
    ],
    controllers: [StickerPackagesController],
    providers: [
        SubjectsRepository,
        ActionsRepository,
        PermissionsService,
        S3Service,
        StickerPackagesService,
        StickerPackagesRepository,
        StickerPackageModelTransform,
    ],
    exports: [],
})
export class StickersModule {}
