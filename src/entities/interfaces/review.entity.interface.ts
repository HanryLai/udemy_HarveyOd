import { IBaseEntity } from './base.entity.interface';

export interface IReviewEntity extends IBaseEntity {
   rating: number;
   comment: string;
}