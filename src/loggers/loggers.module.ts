import { Module } from '@nestjs/common';
import { LoggersService } from './loggers.service';
import { WinstonModule } from 'nest-winston';

import { winstonConfig } from 'src/configs';

@Module({
   imports: [WinstonModule.forRoot(winstonConfig)],
   providers: [LoggersService],
   exports: [LoggersService],
})
export class LoggersModule {}
