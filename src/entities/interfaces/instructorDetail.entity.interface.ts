import { IBaseEntity } from './base.entity.interface';

export interface IInstrucorDetail extends IBaseEntity {
   biography: string;
   website: string;
   socialMedia: string;
   experience: string;
   education: string;
}