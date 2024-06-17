import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany } from 'typeorm';
import { IAssignmentEntity } from '../interfaces';
import { BaseEntity } from '../bases';
import { CourseEntity } from './course.entity';
import { SubmissionEntity } from './submission.entity';

@Entity({ name: 'assignment' })
export class AssignmentEntity extends BaseEntity<AssignmentEntity> implements IAssignmentEntity {
   @Column({ type: 'varchar', default: '', name: 'title' })
   title: string;

   @Column({ type: 'varchar', default: '', name: 'description' })
   description: string;

   @CreateDateColumn({ name: 'due_date' })
   dueDate: Date;

   @Column({ type: 'boolean', default: false, name: 'is_published' })
   isPublished: boolean;

   @ManyToOne(() => CourseEntity, (course) => course.assignments)
   course: CourseEntity;

   @OneToMany(() => SubmissionEntity, (submission) => submission.assignment)
   submissions: SubmissionEntity[];
}
