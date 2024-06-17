import { CustomException } from 'src/common/exceptions';

const checkUsername = (username: string): boolean => {
   try {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const isEmail = emailRegex.test(username);
      if (isEmail) {
         return true;
      }
      return false;
   } catch (error) {
      throw new CustomException(error.message);
   }
};

export default checkUsername;
