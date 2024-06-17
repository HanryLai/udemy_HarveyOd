import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

import { MailService } from '../mail.service';
import { MailQueueConsumer } from './mail-queue.consumer';

import { OtpModule } from '../../otp/otp.module';
@Module({
   imports: [
      BullModule.forRootAsync({
         useFactory: (configService: ConfigService) => ({
            redis: {
               host: configService.get('REDIS_HOST'),
               port: configService.get('REDIS_PORT'),
            },
         }),
         inject: [ConfigService],
      }),
      BullModule.registerQueue({
         name: 'mail',
      }),
      OtpModule,
   ],
   providers: [MailService, MailQueueConsumer],
   exports: [],
})
export class MailQueueModule {}
