import { Module } from '@nestjs/common';
import { QueueManager } from './queue.service';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';


@Module({
   imports: [BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
         redis: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
         },
      }),
      inject: [ConfigService],
   }),

   ],
   exports: [QueueManager],
   providers: [QueueManager],
})
export class QueueModule {
}
