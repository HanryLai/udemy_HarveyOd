import { IBaseEntity } from './base.entity.interface';

export interface IAccountEntity extends IBaseEntity {
   username: string;
   password: string;
   email: string;
   isVerified: boolean;
   lastLogin: Date;
}