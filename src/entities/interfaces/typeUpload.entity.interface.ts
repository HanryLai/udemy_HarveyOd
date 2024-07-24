import { IBaseEntity } from './base.entity.interface';

export interface ITypeUploadEntity extends IBaseEntity {
   type: string[];
   description: string;
   url: string;
   duration: number;
}
