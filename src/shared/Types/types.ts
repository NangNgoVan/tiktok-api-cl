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
    LAUGH,
    HEART,
    LIKE,
}

export enum FeedType {
    IMAGE,
    VIDEO,
}
