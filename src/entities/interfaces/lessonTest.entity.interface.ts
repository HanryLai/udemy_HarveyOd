import { IBaseEntity } from './base.entity.interface';

export interface ILessonTestEntity extends IBaseEntity {
   questionText: string;
   options: string[];
   correctOption: string;
   urlAudio: string;
}
