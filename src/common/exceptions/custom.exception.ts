import { Response } from 'express';
import { MessageResponse } from '../responses';
// import { LoggersService } from 'src/loggers/loggers.service';
import { Logger } from 'winston';
export class ErrorResponse extends Error {
   public message: string;
   public metadata: any;
   public statusCode: number;
   public logger: Logger;
   constructor({ message, statusCode, metadata = {} }: MessageResponse) {
      super();
      this.message = message;
      this.statusCode = statusCode;
      this.metadata = metadata;
   }

   send(res: Response, headers: Record<string, string> = {}): Response {
      this.logger.log(this.message, this.metadata);
      Object.keys(headers).forEach((key) => {
         res.header(key, headers[key]);
      });
      return res.status(this.statusCode).json(this);
   }
}
