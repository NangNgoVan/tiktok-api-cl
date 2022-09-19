import * as _ from 'lodash'

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
    const result = _.pick(originData, props)
    return result
  }

  public serializeDataResponse(type: string, result: object): IDataResponse {
    return {
      type: type,
      data: result,
    }
  }
}

export const dataSerialService = new DataSerializerService()

export class NonceTokenDataResponse {
  nonce: string
}

export class TokenDataResponse {
  token: string
}
