import { IBaseEntity } from './base.entity.interface';

export interface ICourseContentEntity extends IBaseEntity {
   title: string;
   description: string;
   contentData: string;
   orderIndex: number;
}