import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
    CommentNotFoundException,
    DatabaseUpdateFailException,
    FeedNotFoundException,
} from 'src/shared/Exceptions/http.exceptions'
import { Comment, CommentDocument } from 'src/shared/Schemas/comment.schema'
import { Feed, FeedDocument } from 'src/shared/Schemas/feed.schema'
import { User, UserDocument } from 'src/shared/Schemas/user.schema'
import { CommentLevelType } from 'src/shared/Types/types'
import { CreateCommentDto } from '../Dto/create-comment.dto'
import _ from 'lodash'

@Injectable()
export class CommentService {
    constructor(
        @InjectModel(Comment.name)
        private commentModel: Model<CommentDocument>,

        @InjectModel(Feed.name)
        private feedModel: Model<FeedDocument>,

        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
    ) {}

    async createFeedComment(payload: CreateCommentDto) {
        const feed = await this.feedModel.findById(payload.feed_id)
        if (!feed) throw new FeedNotFoundException()

        const createComment = await this.commentModel.create(payload)
        createComment.level = CommentLevelType.LEVEL_ONE

        return createComment.save()
    }

    async createReplyComment(payload: CreateCommentDto) {
        const feed = await this.feedModel.findById(payload.feed_id)
        if (!feed) throw new FeedNotFoundException()

        const comment = await this.commentModel.findById(payload.reply_to)
        if (!comment) throw new CommentNotFoundException()

        const createComment = await this.commentModel.create(payload)
        createComment.level = CommentLevelType.LEVEL_TWO

        return createComment.save()
    }

    async deleteComment(feedId: string, replyTo: string) {
        const feed = await this.feedModel.findById(feedId)
        if (!feed) throw new FeedNotFoundException()

        const comment = await this.commentModel.findById(replyTo)
        if (!comment) throw new CommentNotFoundException()

        if (comment.level === CommentLevelType.LEVEL_TWO) {
            return this.commentModel.deleteOne({ reply_to: replyTo })
        }

        return this.commentModel.deleteMany({
            feed_id: feedId,
            reply_to: replyTo,
        })
    }

    async getCommentByFeedId(feedId: string) {
        const feed = await this.feedModel.findById(feedId)
        if (!feed) throw new FeedNotFoundException()

        const comment = await this.commentModel.find({ feed_id: feedId })
        if (!comment) throw new CommentNotFoundException()

        const listUserInfo = await this.userModel.find({
            _id: comment.map((it) => it.created_by),
        })

        return comment.map((cmt) => {
            const userInfo = listUserInfo.find((u) => cmt.created_by === u.id)
            return {
                ..._.pick(cmt, [
                    '_id',
                    'feed_id',
                    'created_by',
                    'content',
                    'number_of_reaction',
                    'number_of_reply',
                ]),
                created_user: _.pick(userInfo, [
                    '_id',
                    'full_name',
                    'avatar_url',
                ]),
            }
        })
    }

    async getCommentByFeedIdAndCommentId(feedId: string, commentId: string) {
        const feed = await this.feedModel.findById(feedId)
        if (!feed) throw new FeedNotFoundException()

        const currentComment = await this.commentModel.find({
            feed_id: feedId,
            _id: commentId,
        })
        if (!currentComment) throw new CommentNotFoundException()

        const comment = await this.commentModel.find({ reply_to: commentId })

        const listUserInfo = await this.userModel.find({
            _id: comment.map((it) => it.created_by),
        })

        return comment.map((cmt) => {
            const userInfo = listUserInfo.find((u) => cmt.created_by === u.id)
            return {
                ..._.pick(cmt, [
                    '_id',
                    'feed_id',
                    'created_by',
                    'content',
                    'number_of_reaction',
                    'number_of_reply',
                ]),
                created_user: _.pick(userInfo, [
                    '_id',
                    'full_name',
                    'avatar_url',
                ]),
            }
        })
    }
}
