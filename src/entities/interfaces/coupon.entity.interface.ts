import { IBaseEntity } from './base.entity.interface';

export interface ICouponEntity extends IBaseEntity {
   code: string;
   discountPercentage: number;
   expirationDate: Date;
   isActive: boolean;
}