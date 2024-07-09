import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { MessageResponse } from '../responses/interface/message.response.interface';
// import { ErrorResponse } from '../exceptions';
import { Response } from 'express';
import { IHttpException } from './interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
   private message: string;
   private error: any;
   constructor({ message, error }: IHttpException) {
      this.message = message;
      this.error = error;
   }

   catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      //     const request = ctx.getRequest<Request>();

      const status =
         exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

      const errorResponse: MessageResponse = {
         statusCode: status,
         message: this.message,
         metadata: {},
      };
      response.status(status).json(errorResponse);
   }

   // LOGGER
}
