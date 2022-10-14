import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { FeedType } from 'src/shared/Types/types'
import { CreateFeedImageRequestDto } from '../RequestDTO/create-feed-image-request.dto'
import { FeedHashTagsService } from 'src/ui/Modules/Hashtags/Service/feed-hashtags.service'
import { HashTagService } from 'src/ui/Modules/Hashtags/Service/hashtags.service'
import { UsersService } from 'src/ui/Modules/Users/Service/users.service'
import { UserFollowsService } from 'src/ui/Modules/Follows/Service/user-follows.service'
import { FeedResourceService } from 'src/ui/Modules/Feeds/Service/feed-resource.service'
import { ReactionsService } from 'src/ui/Modules/Reactions/Service/reaction.service'
import { BookmarksService } from 'src/ui/Modules/Bookmarks/Service/bookmarks.service'
import _ from 'lodash'
import { S3Service } from '../../../../shared/Services/s3.service'
import { FeedRepository } from '../Repository/feed.repository'
import moment from 'moment/moment'
import { fromBuffer } from 'file-type'
import { v4 as uuidv4 } from 'uuid'
import { FeedResourceRepository } from '../Repository/feed-resource.repository'
import { FeedResource } from '../../../../shared/Schemas/feed-resource.schema'
import { UtilsService } from '../../../../shared/Services/utils.service'
import { FeedService } from './feed.service'
import { UserRepository } from '../../Users/Repository/user.repository'
import { UserDocument } from '../../../../shared/Schemas/user.schema'
import { CreateFeedVideoRequestDto } from '../RequestDTO/create-feed-video-request.dto'

@Injectable()
export class FeedCreatorService {
    private readonly logger: Logger = new Logger(FeedCreatorService.name)

    constructor(
        private readonly feedRepository: FeedRepository,
        private readonly feedResourceRepository: FeedResourceRepository,
        private readonly userRepository: UserRepository,
        private readonly feedHashTagService: FeedHashTagsService,
        private readonly hashTagService: HashTagService,
        private readonly userService: UsersService,
        private readonly userFollowService: UserFollowsService,
        private readonly feedResourcesService: FeedResourceService,
        private readonly feedReactionService: ReactionsService,
        private readonly bookmarkService: BookmarksService,
        private readonly s3Service: S3Service,
        private readonly feedService: FeedService,
        private readonly utilsService: UtilsService,
    ) {}

    async createFeedImages(
        images: Array<Express.Multer.File>,
        createFeedImageRequestDto: CreateFeedImageRequestDto,
        createdBy: string,
    ) {
        const user: UserDocument | undefined =
            await this.userRepository.getById(createdBy)

        if (!user) {
            throw new NotFoundException(`User ${createdBy} not found`)
        }

        const feedResourcesWithoutFeedId: Omit<FeedResource, 'feed_id'>[] =
            await Promise.all(
                _.map(images, async (image: Express.Multer.File) => {
                    const imageBuffer = image.buffer

                    const { ext, mime: mimetype } = await fromBuffer(
                        imageBuffer,
                    )

                    const key = `feed-images/${moment().format(
                        'YYYY-MM-DD',
                    )}/${createdBy}/${uuidv4()}.${ext}`

                    const { Key } = await this.s3Service.uploadFileToS3Bucket(
                        key,
                        mimetype,
                        imageBuffer,
                    )

                    return {
                        path: Key,
                        mimetype,
                        type: FeedType.IMAGE,
                        created_by: createdBy,
                    }
                }),
            )

        const hashtags: string[] =
            this.extractHashtagFromDTOContentAndMergeWithDTOHashtag(
                createFeedImageRequestDto.content,
                createFeedImageRequestDto.hashtags,
            )

        const createdFeed = await this.feedRepository.create({
            type: FeedType.IMAGE,
            content: createFeedImageRequestDto.content,
            created_by: createdBy,
            hashtags,
            allowed_comment: createFeedImageRequestDto.allowed_comment,
        })

        const feedResources: FeedResource[] = _.map(
            feedResourcesWithoutFeedId,
            (feedResourceWithoutFeedId) => {
                return {
                    ...feedResourceWithoutFeedId,
                    feed_id: createdFeed.id,
                }
            },
        )

        try {
            await this.feedResourceRepository.create(feedResources)
        } catch (error) {
            await this.feedRepository.delete(createdFeed.id)
            throw error
        }

        Promise.all([
            this.feedHashTagService.addFeedHashTag(
                createdFeed.id,
                createdBy,
                hashtags,
            ),
            this.hashTagService.addHashTag(hashtags),
        ]).catch((error) => {
            this.logger.error({
                message: 'Failed to Create feed image hashtags',
                error,
                createFeedDto: createFeedImageRequestDto,
                createdFeed,
            })
        })

        user.$inc('number_of_feed', 1)

        return this.feedService.getFeedById(createdFeed.id, createdBy)
    }

    async createFeedVideos(
        thumbnail: Express.Multer.File,
        video: Express.Multer.File,
        createFeedVideoRequestDto: CreateFeedVideoRequestDto,
        createdBy: string,
    ) {
        const user: UserDocument | undefined =
            await this.userRepository.getById(createdBy)

        if (!user) {
            throw new NotFoundException(`User ${createdBy} not found`)
        }

        const feedResourcesWithoutFeedId: Omit<FeedResource, 'feed_id'>[] =
            await Promise.all(
                _.map([video, thumbnail], async (file: Express.Multer.File) => {
                    const fileBuffer = file.buffer

                    const { ext, mime: mimetype } = await fromBuffer(fileBuffer)

                    const key = `feed-video/${moment().format(
                        'YYYY-MM-DD',
                    )}/${createdBy}/${uuidv4()}.${ext}`

                    const { Key } = await this.s3Service.uploadFileToS3Bucket(
                        key,
                        mimetype,
                        fileBuffer,
                    )

                    return {
                        path: Key,
                        mimetype,
                        type: FeedType.VIDEO,
                        created_by: createdBy,
                    }
                }),
            )

        const hashtags: string[] =
            this.extractHashtagFromDTOContentAndMergeWithDTOHashtag(
                createFeedVideoRequestDto.content,
                createFeedVideoRequestDto.hashtags,
            )

        const createdFeed = await this.feedRepository.create({
            type: FeedType.VIDEO,
            content: createFeedVideoRequestDto.content,
            created_by: createdBy,
            hashtags,
            allowed_comment: createFeedVideoRequestDto.allowed_comment,
        })

        const feedResourcesWithFeedId: FeedResource[] = this.mergeWithFeedId<
            Omit<FeedResource, 'feed_id'>
        >(feedResourcesWithoutFeedId, createdFeed.id)

        try {
            await this.feedResourceRepository.create(feedResourcesWithFeedId)
        } catch (error) {
            await this.feedRepository.delete(createdFeed.id)
            throw error
        }

        Promise.all([
            this.feedHashTagService.addFeedHashTag(
                createdFeed.id,
                createdBy,
                hashtags,
            ),
            this.hashTagService.addHashTag(hashtags),
        ]).catch((error) => {
            this.logger.error({
                message: 'Failed to Create feed video hashtags',
                error,
                createFeedVideoRequestDto,
                createdFeed,
            })
        })

        user.$inc('number_of_feed', 1)

        return this.feedService.getFeedById(createdFeed.id, createdBy)
    }

    mergeWithFeedId<T>(
        items: Exclude<T, 'feed_id'>[],
        feedId: string,
    ): (T & { feed_id: string })[] {
        return _.map(items, (item: T) => {
            return _.merge({}, item, { feed_id: feedId })
        })
    }

    extractHashtagFromDTOContentAndMergeWithDTOHashtag(
        content: string | undefined,
        hashtags: string[],
    ) {
        const extractedHashtagsFromContent: string[] =
            this.utilsService.extractHashtagFromString(content)

        return _.compact(
            _.uniq(_.concat(extractedHashtagsFromContent, hashtags)),
        )
    }
}
