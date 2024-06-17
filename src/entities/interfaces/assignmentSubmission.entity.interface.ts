import { IBaseEntity } from './base.entity.interface';

export interface IAssignmentSubmissionEntity extends IBaseEntity {
   content: string;
   submittedAt: Date;
   isGraded: boolean;
   feedback: string;
}