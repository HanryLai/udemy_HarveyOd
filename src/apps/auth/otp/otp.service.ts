import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/common/redis/redis.service';

import { generateOtp } from 'src/utils';
import { MessageResponse } from '../../../common';

@Injectable()
export class OtpService {
   constructor(private redisService: RedisService) {
   }

   public async generateAndStoreOtp(email: string): Promise<string> {
      const otp = generateOtp();
      await this.redisService.set(email, otp, 180);
      return otp;
   }

   public async validateOtp(email: string, otp: string): Promise<MessageResponse> {
      const cacheOtp = await this.redisService.get(email);
      if (!cacheOtp || cacheOtp !== otp) {
         return {
            success: false,
            message: 'OTP is invalid',
            data: {},
         };
      }

      return {
         success: true,
         message: 'OTP is valid',
         data: {},
      };
   }

   public async deleteOtp(email: string): Promise<void> {
      await this.redisService.delete(email);
   }
}
