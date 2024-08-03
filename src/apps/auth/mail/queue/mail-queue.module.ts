import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';


import { MailService } from '../mail.service';
import { MailQueueConsumer } from './mail-queue.consumer';

import { OtpModule } from '../../otp/otp.module';

@Module({
   imports: [
      BullModule.registerQueue({
         name: 'mail',
      }),
      OtpModule,
   ],
   providers: [MailService, MailQueueConsumer],
   exports: [],
})
export class MailQueueModule {
}
