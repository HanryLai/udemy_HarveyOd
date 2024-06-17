import { IBaseEntity } from './base.entity.interface';

export interface ILoginHistory extends IBaseEntity {
   loginTime: Date;
   loginMethod: string;
   ipAddress: string;
   userAgent: string;
}