export const validateUsername = async (username: string): Promise<boolean> => {
   try {
      const specialCharacters = /[!@#$%^&*(),.?":{}|<>]/;
      return specialCharacters.test(username);
   } catch (error) {
      throw new Error(error.message);
   }
};