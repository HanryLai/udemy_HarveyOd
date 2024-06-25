import {
   CanActivate,
   ExecutionContext,
   HttpException,
   HttpStatus,
   Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ExistToken implements CanActivate {
   canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
      const request = context.switchToHttp().getRequest();
      if (!request.headers.authorization)
         throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      return true;
   }
}
