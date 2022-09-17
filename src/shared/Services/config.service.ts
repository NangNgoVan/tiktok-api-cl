
import * as env from 'dotenv'



env.config()

export class ConfigService {
    public getEnv(key: string) : any {
        return process.env[key]
    }

    public getHostPort() : string {

        return this.getEnv('PORT');
    }

    public getDbConnStr() : string {
        return this.getEnv('MONGO');
    }
}


export const configService = new ConfigService();
