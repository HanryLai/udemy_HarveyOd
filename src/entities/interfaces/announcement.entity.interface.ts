import { IBaseEntity } from './base.entity.interface';

export interface IAnnouncement extends IBaseEntity {
   title: string;
   message: string;
}