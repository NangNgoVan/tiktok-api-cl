import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Patch,
    Post,
    Query,
    UploadedFile,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { ExpressAdapter, FileFieldsInterceptor } from '@nestjs/platform-express'
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger'
import { RequirePermissions } from 'src/cms/shared/Decorators/permission.decorator'
import { PermissionGuard } from 'src/cms/shared/Guards/permission.guard'
import { CurrentUser } from 'src/shared/Decorators/current-user.decorator'
import { JwtAuthGuard } from 'src/shared/Guards/jwt-auth.guard'
import { UserData } from 'src/shared/Types/types'
import { ThumbnailValidationPipe } from '../Pipe/validate-thumbnail.pipe'
import { CreateStickerPackageResquestDto } from '../RequestDTO/create-sticker-package-resquest.dto'
import { GetStickerPackageResponseDto } from '../ResponseDTO/get-sticker-package-response.dto'
import { StickerPackagesService } from '../Service/sticker-packages.service'

@Controller('cms/sticker-packages')
@ApiTags('Sticker packages APIs')
export class StickerPackagesController {
    constructor(
        private readonly stickerPackagesService: StickerPackagesService,
    ) {}

    @Get()
    @RequirePermissions(['sticker-packages:read'])
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get Sticker Packages' })
    @ApiOkResponse({
        //type:
    })
    async getStickerPackages(
        @CurrentUser() currentUser: UserData,
        @Query('page') page: number,
    ) {
        return this.stickerPackagesService.getPaginatedStickerPackages(page)
    }

    @Post()
    @RequirePermissions(['sticker-packages:create'])
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'thumbnail', maxCount: 1 }]),
    )
    @ApiConsumes('multipart/form-data')
    @ApiBearerAuth()
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                thumbnail: {
                    type: 'string',
                    format: 'binary',
                },
                cover: {
                    type: 'string',
                },
                name: {
                    type: 'string',
                },
                display_order: {
                    type: 'number',
                },
                description: {
                    type: 'string',
                },
            },
            required: ['thumbnail', 'cover', 'name', 'description'],
        },
    })
    @ApiOperation({ summary: 'Create a sticker package' })
    async createStickerPackage(
        @Body() dto: CreateStickerPackageResquestDto,
        @UploadedFiles(new ThumbnailValidationPipe())
        files: { thumbnail: Express.Multer.File },
        @CurrentUser() currentUser: UserData,
    ) {
        const thumbnailKey = await this.stickerPackagesService.uploadThumbnail(
            files.thumbnail[0],
        )

        return await this.stickerPackagesService.createNewStickerPackage(
            currentUser.userId,
            thumbnailKey,
            dto,
        )
    }

    @Patch('/:id')
    @RequirePermissions(['sticker-packages:update'])
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'thumbnail', maxCount: 1 }]),
    )
    @ApiConsumes('multipart/form-data')
    @ApiBearerAuth()
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                thumbnail: {
                    type: 'string',
                    format: 'binary',
                },
                cover: {
                    type: 'string',
                },
                name: {
                    type: 'string',
                },
                display_order: {
                    type: 'number',
                },
                description: {
                    type: 'string',
                },
            },
        },
    })
    @ApiOperation({ summary: 'Update a sticker package' })
    async updateStickerPackage(
        @Body() dto: Partial<CreateStickerPackageResquestDto>,
        @UploadedFiles()
        files: { thumbnail?: Express.Multer.File },
        @CurrentUser() currentUser: UserData,
        @Param('id') id: string,
    ) {
        const stickerPackage = await this.stickerPackagesService.findById(id)

        if (!stickerPackage)
            throw new NotFoundException('Sticker Package not found')

        let thumbnailKey = null

        if (files && files.thumbnail) {
            thumbnailKey = await this.stickerPackagesService.uploadThumbnail(
                files.thumbnail[0],
            )
            this.stickerPackagesService.deleteThumbnail(
                stickerPackage.thumbnail,
            )
        }

        return await this.stickerPackagesService.updateStickerPackage(
            id,
            dto,
            thumbnailKey,
        )
    }

    @Get('/:id')
    @RequirePermissions(['sticker-packages:read'])
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @ApiOperation({ summary: 'Get a Sticker Package by id' })
    @ApiOkResponse({
        type: GetStickerPackageResponseDto,
    })
    async getStickerPackageById(
        @CurrentUser() currentUser: UserData,
        @Param('id') id: string,
    ): Promise<GetStickerPackageResponseDto> {
        return await this.stickerPackagesService.getStickerPackageById(id)
    }

    @Delete('/:id')
    @RequirePermissions(['sticker-packages:delete'])
    @ApiOperation({ summary: 'Delete a Sticker Package' })
    @UseGuards(JwtAuthGuard, PermissionGuard)
    async deleteStickerPackage(
        @CurrentUser() currentUser: UserData,
        @Param('id') id: string,
    ) {
        await this.stickerPackagesService.deleteStickerPackage(id)
    }
}
