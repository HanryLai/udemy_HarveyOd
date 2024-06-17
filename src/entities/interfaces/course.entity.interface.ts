import { IBaseEntity } from './base.entity.interface';

export interface ICourse extends IBaseEntity {
   title: string;
   description: string;
   language: string[];
   price: number;
   level: string;
   discount: number;
   category: string;
   thunbnailUrl: string;
}
