import { IBaseEntity } from './base.entity.interface';

export interface IModuleEntity extends IBaseEntity {
   title: string;
   description: string;
   orderIndex: number;
   isPublished: boolean;
   isDeleted: boolean;
}