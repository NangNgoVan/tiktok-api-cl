// User gender
export enum UserGenderType {
    MALE = 'male',
    FEMALE = 'female',
}

// Http status object
export interface HttpStatusResult {
    statusCode: any
    message: string
}

export enum UserReactionType {
    LAUGH = 'laugh',
    HEART = 'heart',
    LIKE = 'like',
}

export enum FeedType {
    IMAGE = 'image',
    VIDEO = 'video',
}

export enum AuthenticationMethod {
    METAMASK = 'metamask',
    CREDENTIAL = 'credential',
    TRIAL = 'trial',
}

export enum FeedCommentLevel {
    LEVEL_ONE = 1,
    LEVEL_TWO = 2,
}

export enum FeedFilterType {
    POSTED_BY = 'posted_by',
    BOOKMARKED = 'bookmarked',
    REACTED = 'reacted',
}
export type UserData = {
    userId: string
    roles?: string[]
    permissions?: string[]
}
