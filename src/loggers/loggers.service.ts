import { Inject, Injectable, LoggerService, Scope } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
@Injectable({ scope: Scope.TRANSIENT })
export class LoggersService implements LoggerService {
   private context: string;
   constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}
   setContext(context: string) {
      this.context = context;
   }

   log(message: string, context?: any) {
      context = context || this.context;
      this.logger.info(message, { context });
   }

   error(message: string, trace?: string, context?: any) {
      context = context || this.context;
      this.logger.error(message, { context, trace });
   }

   warn(message: string, context?: any) {
      context = context || this.context;
      // console.log(message);
      this.logger.warn(message, { context });
   }

   debug(message: string, context?: any) {
      context = context || this.context;
      this.logger.debug(message, { context });
   }

   verbose(message: string, context?: any) {
      context = context || this.context;
      this.logger.verbose(message, { context });
   }
}

