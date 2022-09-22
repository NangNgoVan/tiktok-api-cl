import { ApiProperty } from '@nestjs/swagger'

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
    @ApiProperty({
        name: 'nonce',
        description: 'a random string',
    })
    nonce: string
}

export class TokenDataResponse {
    @ApiProperty()
    token: string

    @ApiProperty()
    refreshToken?: string
}

export class UserDataResponse {
    @ApiProperty()
    id: string

    @ApiProperty()
    name: string
}
