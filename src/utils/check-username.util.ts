import { HttpStatus } from '@nestjs/common';
import { ErrorResponse } from 'src/common/exceptions';

const checkUsername = (username: string): boolean => {
   try {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const isEmail = emailRegex.test(username);
      if (isEmail) {
         return true;
      }
      return false;
   } catch (error) {
      throw new ErrorResponse({
         message: 'Error checking username',
         statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
         metadata: {},
      });
   }
};

export default checkUsername;
