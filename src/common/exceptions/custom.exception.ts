export class CustomException extends Error {
   constructor(message: string, public code?: number, public details?: any) {
      super(message);

      // Set the prototype explicitly.
      Object.setPrototypeOf(this, CustomException.prototype);

      this.name = this.constructor.name;

      // Maintain proper stack trace for where our error was thrown (only available on V8 engines)
      if (Error.captureStackTrace) {
         Error.captureStackTrace(this, this.constructor);
      }
   }
}
