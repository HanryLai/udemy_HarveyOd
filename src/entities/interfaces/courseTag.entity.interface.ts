import { IBaseEntity } from './base.entity.interface';

export interface ITagEntity extends IBaseEntity {
   name: string;
   description: string;
}