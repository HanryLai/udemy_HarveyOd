import { IBaseEntity } from './base.entity.interface';

export interface IRole extends IBaseEntity {
   name: string;
   description: string;
   permissions: string[];
}