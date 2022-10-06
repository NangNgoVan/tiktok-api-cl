import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Feed, FeedDocument } from 'src/shared/Schemas/feed.schema'
import { FeedType } from 'src/shared/Types/types'
import { CreateFeedDto } from '../Dto/create-feed.dto'
import { FeedDetailDto } from '../Dto/feed-detail.dto'
import { MongoPaging } from 'mongo-cursor-pagination'
import { FeedHashTagsService } from 'src/ui/Hashtags/Service/feed-hashtags.service'
import { HashTagService } from 'src/ui/Hashtags/Service/hashtags.service'
import { UsersService } from 'src/ui/Users/Service/users.service'
import { UserFollowsService } from 'src/ui/Follows/Service/user-follows.service'
import { PaginateFeedResultsDto } from '../Dto/paginate-feed-results.dto'
import { FeedResourcesService } from 'src/ui/Resources/Service/resources.service'
import { ReactionsService } from 'src/ui/Reactions/Service/reaction.service'
import { BookmarksService } from 'src/ui/Bookmarks/Service/bookmarks.service'
import _ from 'lodash'

@Injectable()
export class FeedsService {
    constructor(
        @InjectModel(Feed.name)
        private readonly feedModel: MongoPaging<FeedDocument>,
        private readonly feedHashTagService: FeedHashTagsService,
        private readonly hashTagService: HashTagService,
        private readonly userService: UsersService,
        private readonly userFollowService: UserFollowsService,
        private readonly feedResourcesService: FeedResourcesService,
        private readonly feedReactionService: ReactionsService,
        private readonly bookmarkService: BookmarksService,
    ) {}

    async createFeed(
        createFeedDto: CreateFeedDto,
        feedType: FeedType,
        resource_ids?: string[],
    ) {
        const createdFeed = await this.feedModel.create(createFeedDto)
        createdFeed.resource_ids = resource_ids
        createdFeed.type = feedType

        /**await */
        this.feedHashTagService.addFeedHashTag(
            createdFeed.id,
            createdFeed.created_by,
            createdFeed.hashtags,
        )
        /**await */
        this.hashTagService.addHashTag(createdFeed.hashtags)

        return createdFeed.save()
    }

    async getNewestFeeds(
        currentUserId: string,
        nextCursor?: string,
        perPage = 6,
    ): Promise<PaginateFeedResultsDto> {
        const options = {
            limit: perPage,
            paginatedField: 'created_at',
            sortAscending: false,
            next: nextCursor,
        }

        const feeds = await this.feedModel.paginate(options)

        const feedIds: string[] = _.map(
            _.get(feeds, 'results', []),
            (feed) => feed._id,
        )

        const transformedFeeds = await this.buildFeeds(feedIds, currentUserId)

        return { ...feeds, results: transformedFeeds }
    }

    async getFeedById(
        feedId: string,
        currentUserId: string,
    ): Promise<FeedDetailDto> {
        const transformedFeeds = await this.buildFeeds([feedId], currentUserId)

        if (_.isEmpty(transformedFeeds)) {
            throw new NotFoundException()
        }

        return _.first(transformedFeeds)
    }

    async getPostedFeeds(
        createdBy: string,
        currentUserId: string,
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

        const feeds = await this.feedModel.paginate(options)

        const feedIds: string[] = _.map(
            _.get(feeds, 'results', []),
            (feed) => feed._id,
        )

        const transformedFeeds = await this.buildFeeds(feedIds, currentUserId)

        return { ...feeds, results: transformedFeeds }
    }

    async getFeedsBySongId(
        songId: string,
        currentUserId: string,
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

        const feeds = await this.feedModel.paginate(options)

        const feedIds: string[] = _.map(
            _.get(feeds, 'results', []),
            (feed) => feed._id,
        )

        const transformedFeeds = await this.buildFeeds(feedIds, currentUserId)

        return { ...feeds, results: transformedFeeds }
    }

    async getBookmarkedFeeds(
        bookmarkedBy: string,
        currentUserId: string,
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

        return { ...feedBookmarks, results: transformedFeeds }
    }

    async getReactedFeeds(
        reactedBy: string,
        currentUserId: string,
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

        const feeds = await this.feedModel.paginate({
            limit: perPage,
            paginatedField: 'created_at',
            sortAscending: false,
            next: nextCursor,
            query: {
                created_by: {
                    $in: followingIds,
                },
            },
        })

        const feedIds: string[] = _.map(
            _.get(feeds, 'results', []),
            (feed) => feed._id,
        )

        const transformedFeeds = await this.buildFeeds(feedIds, currentUserId)

        return { ...feeds, results: transformedFeeds }
    }

    private async buildFeeds(
        feedIds: string[],
        currentUserId: string,
    ): Promise<FeedDetailDto[]> {
        const feeds = await this.feedModel
            .find({
                _id: {
                    $in: feedIds,
                },
            })
            .sort({ created_at: 'desc' })

        const promises = _.map(feeds, async (feed) => {
            const feedDetailDto = new FeedDetailDto()

            const createdUser = await this.userService.findById(feed.created_by)

            feedDetailDto.created_user = {
                nick_name: _.get(createdUser, 'nick_name'),
                full_name: _.get(createdUser, 'full_name'),
                avatar: _.get(createdUser, 'avatar'),
                id: _.get(createdUser, 'id'),
                current_user: {
                    is_followed:
                        await this.userFollowService.checkFollowRelationshipBetween(
                            currentUserId,
                            feed.created_by,
                        ),
                },
            }

            const feedReaction = await this.feedReactionService.getFeedReaction(
                feed._id,
                currentUserId,
            )

            const feedBookmark = await this.bookmarkService.getFeedBookmark(
                feed._id,
                currentUserId,
            )

            feedDetailDto.current_user = {
                is_reacted: !!feedReaction,
                is_bookmarked: !!feedBookmark,
                reaction_type: _.get(feedReaction, 'type'),
            }

            feedDetailDto.id = feed._id
            feedDetailDto.allowed_comment = feed.allowed_comment
            feedDetailDto.number_of_view = feed.number_of_view
            feedDetailDto.number_of_reaction = feed.number_of_reaction
            feedDetailDto.number_of_bookmark = feed.number_of_bookmark
            feedDetailDto.number_of_comment = feed.number_of_comment
            feedDetailDto.number_of_report = feed.number_of_report
            feedDetailDto.created_by = feed.created_by
            feedDetailDto.content = feed.content
            feedDetailDto.song_id = feed.song_id
            feedDetailDto.hashtags = feed.hashtags
            feedDetailDto.primary_image_index = feed.primary_image_index
            feedDetailDto.created_at = feed.created_at

            feedDetailDto.type = feed.type

            const resources = await this.feedResourcesService.getResourceByIds(
                feed.resource_ids,
            )
            if (resources) {
                feedDetailDto.resource_details = resources
            }

            return feedDetailDto
        })

        return Promise.all(promises)
    }
}
