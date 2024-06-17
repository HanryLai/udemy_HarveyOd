export const setExpireAt = (days: number): Date => {
   const expiresAt = new Date();
   expiresAt.setMilliseconds(
      expiresAt.getMilliseconds() + days * 24 * 60 * 60 * 1000,
   );
   return expiresAt;
};
