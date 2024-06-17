import { IBaseEntity } from './base.entity.interface';

export interface ICourseProgress extends IBaseEntity {
   completedLessons: boolean;
   completedQuizzes: boolean;
   progressPercentage: number;
   lastAccessedAt: Date;

}