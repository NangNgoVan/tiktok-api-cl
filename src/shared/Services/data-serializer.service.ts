export declare interface IDataResponse {
    type: string
    data: {
        [key: string]: any
    }
}

export class DataSerializerService {
    public async selectProperties(
        originData: object,
        props: string[],
    ): Promise<object> {
        const result: object = {}
        for await (const prop of props) {
            result[prop] = originData[prop]
        }
        return result
    }

    public serializeDataResponse(type: string, result: object): IDataResponse {
        return {
            type: type,
            data: result,
        }
    }
}

export const dataSerializerService = new DataSerializerService()

export class NonceTokenDataResponse {
    nonce: string
}

export class TokenDataResponse {
    token: string
    refreshToken?: string
}

export class UserDataResponse {
    id: string
    name: string
}
