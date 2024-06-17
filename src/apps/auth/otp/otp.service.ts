import { Injectable } from '@nestjs/common';
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

   public async validateOtp(email: string, otp: string): Promise<any> {
      const cacheOtp = await this.redisService.get(email);
      return cacheOtp === otp;
   }

   public async deleteOtp(email: string): Promise<void> {
      await this.redisService.delete(email);
   }
}
