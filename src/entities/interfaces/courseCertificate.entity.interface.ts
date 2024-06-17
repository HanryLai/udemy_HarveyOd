import { IBaseEntity } from './base.entity.interface';

export interface ICertificateEntity extends IBaseEntity {
   issueDate: Date;
   grade: number;
   certificateUrl: string;
}