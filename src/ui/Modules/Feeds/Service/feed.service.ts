import { Injectable, NotFoundException } from '@nestjs/common'
import { FeedDetailResponseDto } from '../ResponseDTO/feed-detail-response.dto'
import { FeedHashTagsService } from 'src/ui/Modules/Hashtags/Service/feed-hashtags.service'
import { HashTagService } from 'src/ui/Modules/Hashtags/Service/hashtags.service'
import { UsersService } from 'src/ui/Modules/Users/Service/users.service'
import { UserFollowsService } from 'src/ui/Modules/Follows/Service/user-follows.service'
import { PaginateFeedResultsResponseDto } from '../ResponseDTO/paginate-feed-results-response.dto'
import { FeedResourceService } from 'src/ui/Modules/Feeds/Service/feed-resource.service'
import { ReactionsService } from 'src/ui/Modules/Reactions/Service/reaction.service'
import { BookmarksService } from 'src/ui/Modules/Bookmarks/Service/bookmarks.service'
import _ from 'lodash'
import { S3Service } from '../../../../shared/Services/s3.service'
import { configService } from '../../../../shared/Services/config.service'
import { UserDocument } from '../../../../shared/Schemas/user.schema'
import { FeedRepository } from '../Repository/feed.repository'

@Injectable()
export class FeedService {
    constructor(
        private readonly feedHashTagService: FeedHashTagsService,
        private readonly hashTagService: HashTagService,
        private readonly userService: UsersService,
        private readonly userFollowService: UserFollowsService,
        private readonly feedResourcesService: FeedResourceService,
        private readonly feedReactionService: ReactionsService,
        private readonly bookmarkService: BookmarksService,
        private readonly s3Service: S3Service,
        private readonly feedsRepository: FeedRepository,
    ) {}

    async getNewestFeeds(
        currentUserId?: string,
        nextCursor?: string,
        perPage = 6,
    ): Promise<PaginateFeedResultsResponseDto> {
        const options = {
            limit: perPage,
            paginatedField: 'created_at',
            sortAscending: false,
            next: nextCursor,
        }

        const feeds = await this.feedsRepository.getPaginatedFeeds(options)

        const feedIds: string[] = _.map(
            _.get(feeds, 'results', []),
            (feed) => feed._id,
        )

        const transformedFeeds = await this.buildFeeds(feedIds, currentUserId)

        return { ...feeds, results: transformedFeeds }
    }

    async getFeedById(
        feedId: string,
        currentUserId?: string,
    ): Promise<FeedDetailResponseDto> {
        const transformedFeeds = await this.buildFeeds([feedId], currentUserId)

        if (_.isEmpty(transformedFeeds)) {
            throw new NotFoundException()
        }

        return _.first(transformedFeeds)
    }

    async getPostedFeeds(
        createdBy: string,
        currentUserId?: string,
        nextCursor?: string,
        perPage = 6,
    ) {
        const options = {
            limit: perPage,
            paginatedField: 'created_at',
            sortAscending: false,
            next: nextCursor,
            query: {
                created_by: createdBy,
            },
        }

        const feeds = await this.feedsRepository.getPaginatedFeeds(options)

        const feedIds: string[] = _.map(
            _.get(feeds, 'results', []),
            (feed) => feed._id,
        )

        const transformedFeeds = await this.buildFeeds(feedIds, currentUserId)

        return { ...feeds, results: transformedFeeds }
    }

    async getFeedsBySongId(
        songId: string,
        currentUserId?: string,
        nextCursor?: string,
        perPage = 6,
    ) {
        const options = {
            limit: perPage,
            paginatedField: 'created_at',
            sortAscending: false,
            next: nextCursor,
            query: {
                song_id: songId,
            },
        }

        const feeds = await this.feedsRepository.getPaginatedFeeds(options)

        const feedIds: string[] = _.map(
            _.get(feeds, 'results', []),
            (feed) => feed._id,
        )

        const transformedFeeds = await this.buildFeeds(feedIds, currentUserId)

        return { ...feeds, results: transformedFeeds }
    }

    async getBookmarkedFeeds(
        bookmarkedBy: string,
        currentUserId?: string,
        nextCursor?: string,
        perPage = 6,
    ) {
        const feedBookmarks = await this.bookmarkService.getFeedBookmarks(
            bookmarkedBy,
            nextCursor,
            perPage,
        )

        const feedIds: string[] = _.map(
            _.get(feedBookmarks, 'results', []),
            (feedBookmark) => feedBookmark.feed_id,
        )

        const transformedFeeds = await this.buildFeeds(feedIds, currentUserId)

        return {
            ...feedBookmarks,
            results: currentUserId ? transformedFeeds : null,
        }
    }

    async getReactedFeeds(
        reactedBy: string,
        currentUserId?: string,
        nextCursor?: string,
        perPage = 6,
    ) {
        const feedReactions =
            await this.feedReactionService.getPaginatedFeedReactions(
                reactedBy,
                nextCursor,
                perPage,
            )

        const feedIds: string[] = _.map(
            _.get(feedReactions, 'results', []),
            (feedReaction) => feedReaction.feed_id,
        )

        const transformedFeeds = await this.buildFeeds(feedIds, currentUserId)

        return { ...feedReactions, results: transformedFeeds }
    }

    async getFollowingFeeds(
        userId: string,
        currentUserId: string,
        nextCursor?: string,
        perPage = 6,
    ) {
        // FIXME: this is a temporary solution, we should split following ids into multiple pieces
        // then we query by following ids and created_at between a range [start - end]
        const followingIds =
            await this.userFollowService.getAllFollowingIdsByUserId(userId)

        const options = {
            limit: perPage,
            paginatedField: 'created_at',
            sortAscending: false,
            next: nextCursor,
            query: {
                created_by: {
                    $in: followingIds,
                },
            },
        }

        const feeds = await this.feedsRepository.getPaginatedFeeds(options)

        const feedIds: string[] = _.map(
            _.get(feeds, 'results', []),
            (feed) => feed._id,
        )

        const transformedFeeds = await this.buildFeeds(feedIds, currentUserId)

        return { ...feeds, results: transformedFeeds }
    }

    private async buildFeeds(
        feedIds: string[],
        currentUserId?: string,
    ): Promise<FeedDetailResponseDto[]> {
        const feeds = await this.feedsRepository.findBy(
            {
                _id: {
                    $in: feedIds,
                },
            },
            {
                created_at: 'desc',
            },
        )

        const promises = _.map(feeds, async (feed) => {
            const feedDetailDto = new FeedDetailResponseDto()

            const createdUser: UserDocument | undefined =
                await this.userService.getById(feed.created_by)

            const avatarObjectKey = _.get(createdUser, 'avatar')

            const avatarUrl: string | undefined =
                await this.s3Service.getSignedUrl(
                    avatarObjectKey,
                    configService.getEnv('AWS_BUCKET_NAME'),
                    false,
                )

            feedDetailDto.created_user = {
                nick_name: _.get(createdUser, 'nick_name'),
                full_name: _.get(createdUser, 'full_name'),
                avatar: avatarUrl,
                _id: _.get(createdUser, '_id'),
                current_user: currentUserId
                    ? {
                          is_followed:
                              await this.userFollowService.checkFollowRelationshipBetween(
                                  currentUserId,
                                  feed.created_by,
                              ),
                      }
                    : null,
            }

            feedDetailDto.current_user = await this.getCurrentUser(
                feed._id,
                currentUserId,
            )

            feedDetailDto._id = feed._id
            feedDetailDto.allowed_comment = feed.allowed_comment
            feedDetailDto.number_of_view = feed.number_of_view
            feedDetailDto.number_of_reaction = feed.number_of_reaction
            feedDetailDto.number_of_bookmark = feed.number_of_bookmark
            feedDetailDto.number_of_comment = feed.number_of_comment
            feedDetailDto.number_of_report = feed.number_of_report
            feedDetailDto.content = feed.content
            feedDetailDto.hashtags = feed.hashtags
            feedDetailDto.primary_image_index = feed.primary_image_index
            feedDetailDto.created_at = feed.created_at

            feedDetailDto.type = feed.type

            const resources =
                await this.feedResourcesService.getFeedResourcesByFeedId(
                    feed._id,
                )
            if (resources) {
                feedDetailDto.resources = resources
            }

            return feedDetailDto
        })

        return Promise.all(promises)
    }

    async getCurrentUser(feedId: string, currentUserId?: string) {
        if (!currentUserId) return null

        const feedReaction = await this.feedReactionService.getFeedReaction(
            feedId,
            currentUserId,
        )

        const feedBookmark = await this.bookmarkService.getFeedBookmark(
            feedId,
            currentUserId,
        )

        return {
            is_reacted: !!feedReaction,
            is_bookmarked: !!feedBookmark,
            reaction_type: _.get(feedReaction, 'type'),
        }
    }
}
