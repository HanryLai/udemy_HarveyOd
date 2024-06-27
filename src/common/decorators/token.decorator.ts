import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const TokenCurrent = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
   const request = ctx.switchToHttp().getRequest();
   return request.tokenCurrent;
});
