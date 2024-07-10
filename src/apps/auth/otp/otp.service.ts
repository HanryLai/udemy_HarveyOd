import { HttpStatus, Injectable } from '@nestjs/common';
import { ErrorResponse, MessageResponse, OK } from 'src/common';
import { RedisService } from 'src/common/redis/redis.service';

import { generateOtp } from 'src/utils';

@Injectable()
export class OtpService {
   constructor(private redisService: RedisService) {}

   public async generateAndStoreOtp(email: string): Promise<string> {
      const otp = generateOtp();
      await this.redisService.set(email, otp, 180);
      return otp;
   }

   public async validateOtp(email: string, otp: string): Promise<MessageResponse> {
      const cacheOtp = await this.redisService.get(email);
      if (!cacheOtp || cacheOtp !== otp) {
         return new ErrorResponse({
            message: 'OTP is invalid',
            statusCode: HttpStatus.UNAUTHORIZED,
            metadata: {},
         });
      }
      return new OK({
         message: 'Otp is valid',
         metadata: {},
      });
   }

   public async deleteOtp(email: string): Promise<void> {
      await this.redisService.delete(email);
   }
}
