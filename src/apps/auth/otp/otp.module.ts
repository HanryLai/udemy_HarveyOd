import { Module } from '@nestjs/common';

import { OtpService } from './otp.service';
import { RedisService } from 'src/common/redis/redis.service';

@Module({
   providers: [OtpService, RedisService],
   exports: [OtpService],
})
export class OtpModule {}
