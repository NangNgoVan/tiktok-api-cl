import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'
import { deepParseJson } from 'deep-parse-json'
import _ from 'lodash'

type TParseFormDataJsonOptions = {
    except?: string[]
}

@Injectable()
export class ParseFormDataJsonPipe implements PipeTransform {
    constructor(private options?: TParseFormDataJsonOptions) {}

    transform(value: any, metadata: ArgumentMetadata) {
        const except = this.options ? this.options.except : []
        const serializedValue = value
        const originProperties = {}
        if (except?.length) {
            _.merge(originProperties, _.pick(serializedValue, ...except))
        }
        const t = _.pick(value, ...except)
        const deserializedValue = deepParseJson(value)

        return { ...deserializedValue, ...originProperties }
    }
}
