import { Injectable } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

import { HttpExceptionFilter } from 'src/common';
import { ITokenPair } from './interface/tokenPair.interface';
import { IPayload } from './interface/payload.interface';
import { IResponseToken } from './interface';

@Injectable()
export class KeytokenService {
   constructor(private readonly jwtService: JwtService) {}

   public async generateRsaKeyPair(): Promise<{
      publicKey: string;
      privateKey: string;
   }> {
      return new Promise((resolve, reject) => {
         crypto.generateKeyPair(
            'rsa',
            {
               modulusLength: 4096,
               publicKeyEncoding: {
                  type: 'pkcs1',
                  format: 'pem',
               },
               privateKeyEncoding: {
                  type: 'pkcs1',
                  format: 'pem',
               },
            },
            (err, publicKey, privateKey) => {
               if (err) {
                  reject(err);
               } else {
                  resolve({
                     publicKey: publicKey.toString(),
                     privateKey: privateKey.toString(),
                  });
               }
            },
         );
      });
   }

   public async createTokenPair(payload: any, publicKey, privateKey): Promise<ITokenPair> {
      try {
         const accessToken = this.jwtService.sign(payload, {
            secret: privateKey,
            expiresIn: '1d',
            algorithm: 'RS256',
         });
         const refreshToken = this.jwtService.sign(payload, {
            secret: privateKey,
            expiresIn: '30d',
            algorithm: 'RS256',
         });
         return {
            accessToken: accessToken,
            refreshToken: refreshToken,
         };
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Error creating token pair',
            error: error.message,
         });
      }
   }

   public async createNewToken(payload: IPayload): Promise<IResponseToken> {
      try {
         const { publicKey, privateKey } = await this.generateRsaKeyPair();
         const tokenPair = await this.createTokenPair(payload, publicKey, privateKey);

         return {
            accessToken: tokenPair.accessToken,
            refreshToken: tokenPair.refreshToken,
            publicKey: publicKey,
            privateKey: privateKey,
         };
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Error creating new token',
            error: error.message,
         });
      }
   }

   public async verifyToken(token: string, publicKey: string): Promise<IPayload> {
      try {
         return this.jwtService.verify(token, {
            secret: publicKey,
            algorithms: ['RS256'],
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Error verifying token',
            error: error.message,
         });
      }
   }
}
