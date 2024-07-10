import { HttpStatus } from '@nestjs/common';
import { MessageResponse } from './interface';
import { Response } from 'express';
export class SuccessResponse {
   public message: string;
   public metadata: any;
   public statusCode: number;

   constructor({ message, statusCode = HttpStatus.OK, metadata = {} }: MessageResponse) {
      this.message = message;
      this.statusCode = statusCode;
      this.metadata = metadata;
   }

   send(res: Response, headers: Record<string, string> = {}): Response {
      Object.keys(headers).forEach((key) => {
         res.header(key, headers[key]);
      });
      return res.status(this.statusCode).json(this);
   }
}
