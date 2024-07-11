import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { RoleEnum } from 'src/constants';
import { ROLES_KEY } from './role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
   constructor(private reflector: Reflector) {}

   canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
      const reqRoles = this.reflector.getAllAndOverride<RoleEnum[]>(ROLES_KEY, [
         context.getHandler(),
         context.getClass(),
      ]);
      if (!reqRoles) {
         return true;
      }
      const { user } = context.switchToHttp().getRequest();
      return reqRoles.some((role) => user.roles?.includes(role));
   }
}
