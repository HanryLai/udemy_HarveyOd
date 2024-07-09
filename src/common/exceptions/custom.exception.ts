import { Response } from 'express';
import { MessageResponse } from '../responses';
export class ErrorResponse extends Error {
   public message: string;
   public metadata: any;
   public statusCode: number;
   constructor({ message, statusCode, metadata = {} }: MessageResponse) {
      super();
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
