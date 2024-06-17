import { IBaseEntity } from './base.entity.interface';

export interface ISessionEntity extends IBaseEntity {
   refreshToken: string;
   accessToken: string;
   expiresAt: Date;
}