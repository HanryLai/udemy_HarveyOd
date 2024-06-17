import { Column, CreateDateColumn, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../bases';
import { IAssignmentSubmissionEntity } from '../interfaces';
import { AssignmentEntity } from './assignment.entity';

@Entity({ name: 'assignment_submission' })
export class SubmissionEntity
   extends BaseEntity<SubmissionEntity>
   implements IAssignmentSubmissionEntity
{
   @Column({ type: 'varchar', default: '', name: 'content' })
   content: string;

   @CreateDateColumn({ name: 'submitted_at' })
   submittedAt: Date;

   @Column({ type: 'boolean', default: false, name: 'is_graded' })
   isGraded: boolean;

   @Column({ type: 'text', default: '', name: 'feedback' })
   feedback: string;

   @ManyToOne(() => AssignmentEntity, (assignment) => assignment.submissions)
   assignment: AssignmentEntity;
}
