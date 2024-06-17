import { IBaseEntity } from './base.entity.interface';

export interface IProgressDetailEntity extends IBaseEntity {
   contentType: string;
   isCompleted: boolean;
}