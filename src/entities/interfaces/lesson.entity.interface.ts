import { IBaseEntity } from './base.entity.interface';

export interface ILesson extends IBaseEntity {
   title: string;
   content: string;
   videoUrl: string;
   duration: number;
   orderIndex: number;
}
