import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';

import { KeytokenService } from './keytoken.service';
import { KeyTokenEntity } from 'src/entities/auth';

describe('KeytokenService', () => {
   let service: KeytokenService;
   let jwtService: JwtService;

   beforeEach(async () => {
      const jwtServiceMock = {
         sign: jest.fn(),
         verify: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
         providers: [
            KeytokenService,
            { provide: JwtService, useValue: jwtServiceMock },
            { provide: getRepositoryToken(KeyTokenEntity), useClass: Repository },
         ],
      }).compile();

      service = module.get<KeytokenService>(KeytokenService);
      jwtService = module.get<JwtService>(JwtService);
   });

   it('should be defined', () => {
      expect(service).toBeDefined();
   });

   describe('generateRsaKeyPair', () => {
      it('should return a RSA key pair', async () => {
         const result = { publicKey: 'testPublicKey', privateKey: 'testPrivateKey' };
         jest.spyOn(service, 'generateRsaKeyPair').mockImplementation(async () => result);
         expect(await service.generateRsaKeyPair()).toEqual(result);
      });
   });

   describe('createTokenPair', () => {
      it('should return a token pair', async () => {
         const payload = { userId: 1 };
         const publicKey = 'publicKey';
         const privateKey = 'privateKey';
         const token = 'token';

         jest.spyOn(jwtService, 'sign').mockReturnValue(token);

         const result = await service.createTokenPair(payload, publicKey, privateKey);

         expect(result).toEqual({ accessToken: token, refreshToken: token });
         expect(jwtService.sign).toHaveBeenCalledWith(payload, expect.anything());
      });
   });

   describe('createNewToken', () => {
      it('should return a new token', async () => {
         const result = {
            accessToken: 'testAccessToken',
            refreshToken: 'testRefreshToken',
            publicKey: 'testPublicKey',
            privateKey: 'testPrivateKey',
         };

         jest.spyOn(service, 'createNewToken').mockImplementation(async () => result);
         expect(
            await service.createNewToken({
               id: '',
               username: '',
            }),
         ).toEqual(result);
      });
   });
});
