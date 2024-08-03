import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpExceptionFilter } from 'src/common';
import { RoleEntity } from 'src/entities/auth';
import { RoleRepository } from 'src/repositories/auth';

@Injectable()
export class RolesService {
   constructor(@InjectRepository(RoleEntity) private readonly roleRepository: RoleRepository) {}

   public createRoleAdmin() {
      try {
         return new Promise((resolve, reject) => {
            this.roleRepository
               .save({
                  name: 'ADMIN',
                  description: 'Administrator',
                  permissions: ['*'],
               })
               .then((role) => {
                  if (role) {
                     resolve(true);
                  } else {
                     reject(false);
                  }
               })
               .catch((error) => {
                  reject(error);
               });
         });
      } catch (error) {
         throw new HttpExceptionFilter({
            message: 'Create role failed',
            error: error,
         });
      }
   }
}
