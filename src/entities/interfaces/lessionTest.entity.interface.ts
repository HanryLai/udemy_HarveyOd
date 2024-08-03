import { IBaseEntity } from './base.entity.interface';

export interface ILessionTest extends IBaseEntity {
   question: string;
   options: string[];
   correctAnswer: string;
   urlAudio: string;
}