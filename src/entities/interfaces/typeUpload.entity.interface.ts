import { IBaseEntity } from './base.entity.interface';

export interface ITypeUpload extends IBaseEntity {
   type: string;
   description: string;
   url: string;
   duration: number;
}