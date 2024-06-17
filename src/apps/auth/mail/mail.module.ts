import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { RedisService } from 'src/common/redis/redis.service';
import { MailService } from './mail.service';
import { MailQueueModule } from './queue/mail-queue.module';
import { MailController } from './mail.controller';
import { OtpService } from '../otp/otp.service';

@Module({
   imports: [
      MailerModule.forRootAsync({
         imports: [ConfigModule],
         useFactory: async (configService: ConfigService) => ({
            transport: {
               host: configService.get('MAIL_HOST'),
               port: configService.get('MAIL_PORT'),
               secure: false,
               auth: {
                  user: configService.get('MAIL_USER'),
                  pass: configService.get('MAIL_PASSWORD'),
               },
            },
            defaults: {
               from: `"No Reply" <${configService.get('MAIL_USER')}> `,
            },
         }),
         inject: [ConfigService],
      }),
      BullModule.registerQueue({
         name: 'mail',
      }),

      MailQueueModule,
   ],
   providers: [MailService, OtpService, RedisService],
   exports: [MailService],
   controllers: [MailController],
})
export class MailModule {}
