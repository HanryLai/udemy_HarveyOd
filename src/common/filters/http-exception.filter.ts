import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { MessageResponse } from '../responses/message.response.interface';
import { CustomException } from '../exceptions';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
   catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      //     const request = ctx.getRequest<Request>();

      const status =
         exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Internal Server Error';
      if (exception instanceof CustomException) {
         message = exception.message;
      }
      const errorResponse: MessageResponse = {
         success: false,
         message,
         data: {},
      };
      response.status(status).json(errorResponse);
   }
}