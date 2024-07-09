import { HttpStatus } from '@nestjs/common';
import { MessageResponse } from './interface';
import { SuccessResponse } from './success.response';

export class OK extends SuccessResponse {
   constructor({ message, metadata }: Omit<MessageResponse, 'statusCode'>) {
      super({ message, statusCode: HttpStatus.OK, metadata });
   }
}
