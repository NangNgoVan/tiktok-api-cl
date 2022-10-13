import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    ParseFilePipeBuilder,
    Patch,
    Post,
    Query,
    UploadedFile,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import {
    ApiBody,
    ApiConsumes,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger'
import { RequirePermissions } from 'src/cms/shared/Decorators/permission.decorator'
import { PermissionGuard } from 'src/cms/shared/Guards/permission.guard'
import { DatabaseUpdateFailException } from 'src/shared/Exceptions/http.exceptions'
import { JwtAuthGuard } from 'src/shared/Guards/jwt-auth.guard'
import { CreateSongRequestDto } from '../RequestDTO/create-song-request.dto'
import { GetSongResponseDto } from '../ResponseDTO/get-song-request.dto'
import { SongsService } from '../Service/songs.service'

import { UpdateSongRequestDto } from '../RequestDTO/update-song-request.dto'

import getMp3Duration from 'get-mp3-duration'
import { CurrentUser } from 'src/shared/Decorators/current-user.decorator'
import { UserData } from 'src/shared/Types/types'

@Controller('cms/songs')
@ApiTags('CMS Songs API')
export class SongsController {
    constructor(private readonly songsService: SongsService) {}
    @Get()
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @RequirePermissions(['songs:read'])
    @ApiQuery({
        name: 'page',
        required: false,
    })
    @ApiOperation({
        summary: 'Get all songs',
    })
    async getSongs(@Query('page') page?: number) {
        return this.songsService.getPaginatedSongs(page)
    }

    @Get(':id')
    @ApiOkResponse({
        type: GetSongResponseDto,
    })
    @ApiOperation({
        summary: 'Get song by id',
    })
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @RequirePermissions(['songs:read'])
    async getSongById(@Param('id') id: string): Promise<GetSongResponseDto> {
        return this.songsService.findById(id)
    }

    @Post()
    @ApiOperation({
        summary: 'Create a new song',
    })
    @RequirePermissions(['songs:create'])
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'audio', maxCount: 1 },
            { name: 'thumbnail', maxCount: 1 },
        ]),
    )
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                audio: {
                    type: 'string',
                    format: 'binary',
                },
                thumbnail: {
                    type: 'string',
                    format: 'binary',
                },
                name: {
                    type: 'string',
                },
                artist: {
                    type: 'string',
                },
            },
        },
    })
    async createSong(
        @UploadedFiles()
        files: { audio: Express.Multer.File; thumbnail: Express.Multer.File },
        @Body() dto: CreateSongRequestDto,
        @CurrentUser() user: UserData,
    ): Promise<GetSongResponseDto> {
        const createdSong = await this.songsService.createSong(user.userId, dto)
        if (!createdSong) throw new DatabaseUpdateFailException()

        const [uploadedAudio, uploadedThumbnail] = await Promise.all([
            this.songsService.uploadAudioData(files.audio[0]),
            this.songsService.uploadThumbnailData(files.thumbnail[0]),
        ])

        return await this.songsService.updateSong(createdSong.id, {
            path: uploadedAudio.Key,
            thumbnail: uploadedThumbnail.Key,
            duration_in_second: getMp3Duration(files.audio[0].buffer) / 1000,
        })
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @RequirePermissions(['songs:update'])
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'audio', maxCount: 1 },
            { name: 'thumbnail', maxCount: 1 },
        ]),
    )
    @ApiOperation({
        summary: 'Update song by id',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                audio: {
                    type: 'string',
                    format: 'binary',
                },
                thumbnail: {
                    type: 'string',
                    format: 'binary',
                },
                name: {
                    type: 'string',
                },
                artist: {
                    type: 'string',
                },
            },
        },
    })
    async updateSongById(
        @Param('id') id: string,
        @UploadedFiles()
        files: { audio?: Express.Multer.File; thumbnail?: Express.Multer.File },
        @Body() dto: Partial<CreateSongRequestDto>,
        @CurrentUser() user: UserData,
    ) {
        const song = this.songsService.findById(id)
        if (!song) {
            throw new BadRequestException(`Song not found!`)
        }

        const updateSongDto = dto as UpdateSongRequestDto

        if (files) {
            if (files.audio) {
                const uploadedAudio = await this.songsService.uploadAudioData(
                    files.audio[0],
                )
                updateSongDto.path = uploadedAudio.Key
                updateSongDto.duration_in_second =
                    getMp3Duration(files.audio[0].buffer) / 1000
            }

            if (files.thumbnail) {
                const uploadedThumbnail =
                    await this.songsService.uploadThumbnailData(
                        files.thumbnail[0],
                    )
                updateSongDto.thumbnail = uploadedThumbnail.Key
            }
        }

        return await this.songsService.updateSong(id, updateSongDto)
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @RequirePermissions(['songs:delete'])
    @ApiOperation({
        summary: 'Delete song by id',
    })
    async deleteSongById(@Param('id') id: string) {
        this.songsService.softDeleteSong(id)
    }
}
