// Nest dependencies
import { Injectable, 
    BadRequestException, 
    NotFoundException,
    HttpStatus,
    UnauthorizedException,
 } from '@nestjs/common'

import { JwtService } from '@nestjs/jwt'
import { configService } from 'src/shared/Services/config.service';
import { dataSerialService, IDataResponse, TokenDataResponse, NonceTokenDataResponse } from 'src/shared/Services/data-serializer.service'

import Web3 from 'web3'
import * as crypto from 'crypto'

import { CredentialDto } from '../Dto/credential.dto';
import { CreateSignatureDto } from '../Dto/create-signature.dto';
import { HttpStatusResult } from '../Types/types';


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

    async logInWithMetamask(dto : CreateSignatureDto) : Promise<TokenDataResponse> {
        const { nonce, signature }  = dto
        const web3 = new Web3
        const token = web3.eth.accounts.recover(nonce, signature) 
        
        if (!token) throw new UnauthorizedException();

        const dataResponse = {
            token: token
        };
        return dataResponse;
    }

    async logInWithCredential(dto: CredentialDto) : Promise<TokenDataResponse> {

        const token = 'token';

        const dataResponse = {
            token: token
        };

        return dataResponse;
    }

    async logOut() : Promise<HttpStatusResult> {
        return {
            statusCode: HttpStatus.OK,
            message: "Logout ok!"
        }
    }
}
