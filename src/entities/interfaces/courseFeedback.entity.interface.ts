import { IBaseEntity } from './base.entity.interface';

export interface IFeedback extends IBaseEntity {
   rating: number;
   feedbackText: string;
   feedbackDate: Date;
}