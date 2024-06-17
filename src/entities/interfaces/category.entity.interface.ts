import { IBaseEntity } from './base.entity.interface';

export interface ICategory extends IBaseEntity {
   name: string;
   description: string;

}