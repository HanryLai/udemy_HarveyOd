import { IBaseEntity } from './base.entity.interface';

export interface ILessonTest extends IBaseEntity {
   question: string;
   options: string[];
   correctAnswer: string;
   urlAudio: string;
}