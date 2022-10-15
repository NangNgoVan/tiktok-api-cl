import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Subject } from 'rxjs'
import { Action } from 'rxjs/internal/scheduler/Action'
import { ActionSchema } from 'src/shared/Schemas/action.schema'
import { Song, SongSchema } from 'src/shared/Schemas/song.schema'
import { SubjectSchema } from 'src/shared/Schemas/subject.schema'
import { S3Service } from 'src/shared/Services/s3.service'
import { UtilsService } from 'src/shared/Services/utils.service'
import { PermissionsService } from '../Users/Service/permissions.service'
import { SongsController } from './Controller/songs.controller'
import { SongsRepository } from './Repositories/songs.repository'
import { SongsService } from './Service/songs.service'
import { SongModelTransformService } from './Transformer/song-model.transform'
import { ActionsRepository } from '../Users/Repository/actions.repository'
import { SubjectsRepository } from '../Users/Repository/subjects.repository'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Song.name,
                schema: SongSchema,
            },
            {
                name: Action.name,
                schema: ActionSchema,
            },
            {
                name: Subject.name,
                schema: SubjectSchema,
            },
        ]),
    ],
    controllers: [SongsController],
    providers: [
        SongsService,
        SongsRepository,
        ActionsRepository,
        SubjectsRepository,
        PermissionsService,
        S3Service,
        UtilsService,
        SongModelTransformService,
    ],
    exports: [SongsService, SongsRepository],
})
export class SongsModule {}
