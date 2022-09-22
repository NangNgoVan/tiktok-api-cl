import * as env from 'dotenv'

env.config()

export class ConfigService {
    public getEnv(key: string): any {
        return process.env[key]
    }

    public getHostPort(): string {
        return this.getEnv('PORT')
    }

    public getDbConnStr(): string {
        return this.getEnv('MONGO')
    }

    public AWS3Configuration() {
        return {
            accessKeyId: this.getEnv('AWS_ACCESS_KEY_ID'),
            secretAccessKey: this.getEnv('AWS_SECRET_ACCESS_KEY'),
        }
    }
}

export const configService = new ConfigService()
