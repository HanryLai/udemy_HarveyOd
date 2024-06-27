import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RequestInterceptor implements NestInterceptor {
   intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
      console.log('before interceptor');
      const request = context.switchToHttp().getRequest();
      const refreshToken = request.headers.authorization.split(' ')[1];
      if (refreshToken) {
         request.tokenCurrent = refreshToken;
      }
      return next.handle();
   }
}
