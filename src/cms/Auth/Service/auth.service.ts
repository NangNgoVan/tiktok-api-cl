// Nest dependencies
import { Injectable, 
            BadRequestException, 
            NotFoundException,
         } from '@nestjs/common'

import { JwtService } from '@nestjs/jwt'
import { configService } from 'src/shared/Services/config.service';
import { dataSerialService, IDataResponse, TokenDataResponse, NonceTokenDataResponse } from 'src/shared/Services/data-serializer.service'

import Web3 from 'web3'
import * as crypto from 'crypto'

import { CredentialDto } from '../Dto/credential.dto';


@Injectable()
export class AuthService {
    constructor (private readonly jwtService : JwtService) {

    }

    async createNonce() : Promise<NonceTokenDataResponse> {
        const nonceCreatedByCrypto = crypto.randomBytes(16).toString('base64')
        
        const dataResponse = {
            nonce: nonceCreatedByCrypto
        }

        return dataResponse;
    }

    async logInWithCredential(dto: CredentialDto) : Promise<TokenDataResponse> {

        const token = 'token';

        const dataResponse = {
            token: token
        };
        
        return dataResponse;
    }
}
