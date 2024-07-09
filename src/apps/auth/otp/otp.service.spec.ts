import { Test, TestingModule } from '@nestjs/testing';
import { OtpService } from './otp.service';
import { RedisService } from 'src/common/redis/redis.service';
import { ErrorResponse, OK } from 'src/common';

describe('OtpService', () => {
   let service: OtpService;
   let redisService: RedisService;

   beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
         providers: [
            OtpService,
            {
               provide: RedisService,
               useValue: {
                  set: jest.fn(),
                  get: jest.fn(),
                  ttl: jest.fn(),
                  delete: jest.fn(),
                  generateOtp: jest.fn(),
               },
            },
         ],
      }).compile();

      service = module.get<OtpService>(OtpService);
      redisService = module.get<RedisService>(RedisService);
   });

   it('should validate OTP', async () => {
      const email = 'test@example.com';
      const otp = '123456';

      jest.spyOn(redisService, 'get').mockImplementation(() => Promise.resolve(otp));

      const result = await service.validateOtp(email, otp);

      expect(result).toStrictEqual(
         new OK({
            message: 'Otp is valid',
            metadata: {},
         }),
      );
      expect(redisService.get).toHaveBeenCalledWith(email);
   });

   it('should not validate OTP if it does not match', async () => {
      const email = 'test@example.com';
      const otp = '123456';
      const wrongOtp = '654321';

      jest.spyOn(redisService, 'get').mockImplementation(() => Promise.resolve(otp));

      const result = await service.validateOtp(email, wrongOtp);

      expect(result).toStrictEqual(
         new ErrorResponse({
            message: 'OTP is invalid',
            metadata: {},
         }),
      );
      expect(redisService.get).toHaveBeenCalledWith(email);
   });

   describe('deleteOtp', () => {
      it('should delete the OTP associated with the given email', async () => {
         const email = 'test@test.com';

         const deleteSpy = jest
            .spyOn(redisService, 'delete')
            .mockImplementation(() => Promise.resolve());

         await service.deleteOtp(email);

         expect(deleteSpy).toHaveBeenCalledWith(email);
      });
   });
});
