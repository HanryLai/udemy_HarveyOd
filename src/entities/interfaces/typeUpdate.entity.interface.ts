import { IBaseEntity } from './base.entity.interface';

export interface ITypeUpdateEntity extends IBaseEntity {
   type: string[];
   description: string;
   url: string;
   duration: number;
}
