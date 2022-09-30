import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { DatabaseUpdateFailException } from 'src/shared/Exceptions/http.exceptions'
import { Feed, FeedDocument } from 'src/shared/Schemas/feed.schema'
import { FeedType, UserReactionType } from 'src/shared/Types/types'
import { AddFeedResourceDto } from '../../Resources/Dto/add-feed-resource.dto'
import { CreateFeedDto } from '../Dto/create-feed.dto'
import { FeedDetailDto } from '../Dto/feed-detail.dto'
import { MongoPaging } from 'mongo-cursor-pagination'
import { FeedHashTagsService } from 'src/ui/Hashtags/Service/feed-hashtags.service'
import { HashTagService } from 'src/ui/Hashtags/Service/hashtags.service'
import { UsersService } from 'src/ui/Users/Service/users.service'
import { CreatedUserDto } from '../../../shared/Dto/created-user.dto'
import { UserFollowsService } from 'src/ui/Follows/Service/user-follows.service'
import { PaginateFeedResultsDto } from '../Dto/paginate-feed-results.dto'
import { FeedResourcesService } from 'src/ui/Resources/Service/resources.service'
import { FeedReactionsService } from 'src/ui/Reactions/Service/feed-reaction.service'

@Injectable()
export class FeedsService {
    constructor(
        @InjectModel(Feed.name)
        private readonly feedModel: MongoPaging<FeedDocument>,
        private readonly feedHashTagService: FeedHashTagsService,
        private readonly hashTagService: HashTagService,
        private readonly userService: UsersService,
        private readonly userfollowsService: UserFollowsService,
        private readonly feedResourcesService: FeedResourcesService,
        private readonly feedReactionService: FeedReactionsService,
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
        this.hashTagService.addHashTag(
            createdFeed.created_by,
            createdFeed.hashtags,
        )

        return createdFeed.save()
    }

    async getNewestFeed(
        userId: string,
        next?: string,
        rowsPerpage?: number,
    ): Promise<PaginateFeedResultsDto> {
        try {
            if (!rowsPerpage) rowsPerpage = 5
            let feeds = undefined
            if (!next) {
                feeds = await this.feedModel.paginate({
                    limit: rowsPerpage,
                    paginatedField: 'created_at',
                    sortAscending: false,
                })
            } else {
                feeds = await this.feedModel.paginate({
                    limit: rowsPerpage,
                    next: next,
                    paginatedField: 'created_at',
                    sortAscending: false,
                })
            }
            const feedWithAuthors = await Promise.all(
                feeds.results.map(async (feed) => {
                    const feedDetailDto = new FeedDetailDto()

                    const createdUser = await this.userService.findById(
                        feed.created_by,
                    )

                    feedDetailDto.created_user = {
                        nick_name: createdUser.nick_name,
                        full_name: createdUser.full_name,
                        avatar: createdUser.avatar,
                        current_user: {
                            is_followed:
                                await this.userfollowsService.checkFollowRelationshipBetween(
                                    userId,
                                    feed.created_by,
                                ),
                        },
                        id: createdUser.id,
                    }
                    const userReaction =
                        await this.feedReactionService.getUserReactionWithFeed(
                            userId,
                            feed.id,
                        )
                    feedDetailDto.current_user = {
                        is_reacted: userReaction ? true : false,
                        is_bookmarked: false,
                        reaction_type: userReaction,
                    }
                    feedDetailDto.id = feed.id
                    feedDetailDto.allowed_comment = feed.allowed_comment
                    feedDetailDto.number_of_view = feed.number_of_view
                    feedDetailDto.number_of_reaction = feed.number_of_reaction
                    feedDetailDto.number_of_bookmark = feed.number_of_bookmark
                    feedDetailDto.number_of_report = feed.number_of_report
                    feedDetailDto.created_by = feed.created_by
                    feedDetailDto.content = feed.content
                    feedDetailDto.song_id = feed.song_id
                    feedDetailDto.hashtags = feed.hashtags
                    feedDetailDto.primary_image_index = feed.primary_image_index

                    const resources =
                        await this.feedResourcesService.getResourceByIds(
                            feed.resource_ids,
                        )
                    if (resources) {
                        feedDetailDto.resource_details = resources
                    }

                    return feedDetailDto
                }),
            )
            feeds.results = feedWithAuthors
            return feeds
        } catch (e) {
            //throw or return empty
            return new PaginateFeedResultsDto()
        }
    }

    async getFeedDetail(
        userId: string,
        feedId: string,
    ): Promise<FeedDetailDto> {
        const feed = await this.feedModel.findById(feedId)
        const feedDetailDto = new FeedDetailDto()

        const createdUser = await this.userService.findById(feed.created_by)

        feedDetailDto.created_user = {
            nick_name: createdUser.nick_name,
            full_name: createdUser.full_name,
            avatar: createdUser.avatar,
            current_user: {
                is_followed:
                    await this.userfollowsService.checkFollowRelationshipBetween(
                        userId,
                        feed.created_by,
                    ),
            },
            id: createdUser.id,
        }

        const userReaction =
            await this.feedReactionService.getUserReactionWithFeed(
                userId,
                feed.id,
            )
        feedDetailDto.current_user = {
            is_reacted: userReaction ? true : false,
            is_bookmarked: false,
            reaction_type: userReaction,
        }

        feedDetailDto.id = feed.id
        feedDetailDto.allowed_comment = feed.allowed_comment
        feedDetailDto.number_of_view = feed.number_of_view
        feedDetailDto.number_of_reaction = feed.number_of_reaction
        feedDetailDto.number_of_bookmark = feed.number_of_bookmark
        feedDetailDto.number_of_report = feed.number_of_report
        feedDetailDto.created_by = feed.created_by
        feedDetailDto.content = feed.content
        feedDetailDto.song_id = feed.song_id
        feedDetailDto.hashtags = feed.hashtags
        feedDetailDto.primary_image_index = feed.primary_image_index

        const resources = await this.feedResourcesService.getResourceByIds(
            feed.resource_ids,
        )
        if (resources) {
            feedDetailDto.resource_details = resources
        }

        return feedDetailDto
    }

    async getFeedsPostedByUser(
        userId: string,
        next?: string,
        rowsPerpage?: number,
    ): Promise<PaginateFeedResultsDto> {
        try {
            if (!rowsPerpage) rowsPerpage = 5
            let feeds = undefined
            if (!next) {
                feeds = await this.feedModel.paginate({
                    query: {
                        created_by: userId,
                    },
                    limit: rowsPerpage,
                })
            } else {
                feeds = await this.feedModel.paginate({
                    query: {
                        created_by: userId,
                    },
                    limit: rowsPerpage,
                    next: next,
                })
            }

            const feedsWithResourceDetail = await Promise.all(
                feeds.results.map(async (feed) => {
                    const feedDetailDto = new FeedDetailDto()

                    const createdUser = await this.userService.findById(
                        feed.created_by,
                    )

                    feedDetailDto.created_user = {
                        nick_name: createdUser.nick_name,
                        full_name: createdUser.full_name,
                        avatar: createdUser.avatar,
                        current_user: {
                            is_followed:
                                await this.userfollowsService.checkFollowRelationshipBetween(
                                    userId,
                                    feed.created_by,
                                ),
                        },
                        id: createdUser.id,
                    }

                    const userReaction =
                        await this.feedReactionService.getUserReactionWithFeed(
                            userId,
                            feed.id,
                        )
                    feedDetailDto.current_user = {
                        is_reacted: userReaction ? true : false,
                        is_bookmarked: false,
                        reaction_type: userReaction,
                    }

                    feedDetailDto.id = feed.id
                    feedDetailDto.allowed_comment = feed.allowed_comment
                    feedDetailDto.number_of_view = feed.number_of_view
                    feedDetailDto.number_of_reaction = feed.number_of_reaction
                    feedDetailDto.number_of_bookmark = feed.number_of_bookmark
                    feedDetailDto.number_of_report = feed.number_of_report
                    feedDetailDto.created_by = feed.created_by
                    feedDetailDto.content = feed.content
                    feedDetailDto.song_id = feed.song_id
                    feedDetailDto.hashtags = feed.hashtags
                    feedDetailDto.primary_image_index = feed.primary_image_index

                    const resources =
                        await this.feedResourcesService.getResourceByIds(
                            feed.resource_ids,
                        )
                    if (resources) {
                        feedDetailDto.resource_details = resources
                    }

                    return feedDetailDto
                }),
            )
            feeds.results = feedsWithResourceDetail
            return feeds
        } catch {
            //throw
            //return
            return new PaginateFeedResultsDto()
        }
    }
}
