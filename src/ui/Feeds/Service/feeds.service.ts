import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { DatabaseUpdateFailException } from 'src/shared/Exceptions/http.exceptions'
import { Feed, FeedDocument } from 'src/shared/Schemas/feed.schema'
import { FeedType } from 'src/shared/Types/types'
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
    ) {}

    async createFeed(
        createFeedDto: CreateFeedDto,
        feedType: FeedType,
        resource_ids?: string[],
    ) {
        const createdFeed = await this.feedModel.create(createFeedDto)
        createdFeed.resource_ids = resource_ids
        createdFeed.type = feedType

        /**await */ this.feedHashTagService.addFeedHashTag(
            createdFeed.id,
            createdFeed.created_by,
            createdFeed.hashtags,
        )
        /**await */ this.hashTagService.addHashTag(
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
                    const user = await this.userService.findById(
                        feed.created_by,
                    )
                    if (user) {
                        const feedAuthor = {
                            id: user.id,
                            full_name: user.full_name,
                            nick_name: user.nick_name,
                            avatar: user.avatar,
                        } as CreatedUserDto

                        feedAuthor.current_user = {
                            is_followed:
                                await this.userfollowsService.checkFollowRelationshipBetween(
                                    userId,
                                    user.id,
                                ),
                        }

                        feed['created_user'] = feedAuthor
                    }

                    const resources =
                        await this.feedResourcesService.getResourceByIds(
                            feed.resource_ids,
                        )
                    if (resources) {
                        feed['resource_details'] = resources
                    }
                    return feed
                }),
            )
            feeds.results = feedWithAuthors
            return feeds
        } catch (e) {
            //throw or return empty
            return new PaginateFeedResultsDto()
        }
    }

    async getFeedDetail(feedId: string) {
        return await this.feedModel.findById(feedId)
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
                    query: { created_by: userId },
                    limit: rowsPerpage,
                })
            } else {
                feeds = await this.feedModel.paginate({
                    query: { created_by: userId },
                    limit: rowsPerpage,
                    next: next,
                })
            }

            const feedsWithResourceDetail = await Promise.all(
                feeds.results.map(async (feed) => {
                    const resources =
                        await this.feedResourcesService.getResourceByIds(
                            feed.resource_ids,
                        )
                    if (resources) {
                        feed['resource_details'] = resources
                    }
                    return feed
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
