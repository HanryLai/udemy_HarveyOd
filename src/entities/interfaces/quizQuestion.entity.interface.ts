import { IBaseEntity } from './base.entity.interface';

export interface IQuizQuestionEntity extends IBaseEntity {
   questionText: string;
   options: string[];
   correctOption: boolean;
}