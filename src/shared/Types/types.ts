// User gender
export enum UserGenderType {
  MALE = 'male',
  FEMALE = 'female',
}

// User authentication method
export enum UserAuthMethodType {
  CREDENTIAL = 'credential',
  METAMASK = 'metamask',
}

// Reaction type
export enum ReactionType {
  HEART = 'heart',
  LIKE = 'like',
  LAUGH = 'laugh',
}

// Http status object
export interface HttpStatusResult {
  statusCode: any
  message: string
}
