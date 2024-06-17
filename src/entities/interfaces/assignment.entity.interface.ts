import { IBaseEntity } from './base.entity.interface';

export interface IAssignmentEntity extends IBaseEntity {
   title: string;
   description: string;
   dueDate: Date;
   isPublished: boolean;
}