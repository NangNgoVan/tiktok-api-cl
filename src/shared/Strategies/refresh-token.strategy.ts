import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { Injectable } from '@nestjs/common'
import { configService } from '../Services/config.service'

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
    Strategy,
    'jwt-refresh',
) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.getEnv('JWT_REFRESH_TOKEN_SECRET'),
            passReqToCallback: true,
        })
    }

    validate(req: Request, payload: any) {
        const refreshToken = req
            .get('Authorization')
            .replace('Bearer', '')
            .trim()
        return { ...payload, refreshToken }
    }
}
