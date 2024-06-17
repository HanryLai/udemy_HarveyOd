import { EGender } from 'src/constants';
import { IBaseEntity } from './base.entity.interface';

export interface IDetailAccount extends IBaseEntity {
   fullName: string;
   birthDate: Date;
   gender: EGender;
   avatar: string;
   phone: string;
   bio: string;
}