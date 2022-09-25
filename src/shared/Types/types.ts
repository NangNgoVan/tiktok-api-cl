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

export enum CommentLevelType {
    LEVEL_ONE = 1,
    LEVEL_TWO = 2,
}
