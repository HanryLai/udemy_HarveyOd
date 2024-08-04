import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../bases';
import { ICourseProgress } from '../interfaces';
import { CourseEntity } from '../courses/course.entity';
import { AccountEntity } from '../accounts/account.entity';
import { ProgresDetailsEntity } from './progresDetail.entity';

@Entity({ name: 'course_progress' })
export class CourseProgressEntity
   extends BaseEntity<CourseProgressEntity>
   implements ICourseProgress
{
   @Column({ type: 'boolean', default: false, name: 'completed_lessons' })
   completedLessons: boolean;

   @Column({ type: 'boolean', default: false, name: 'completed_quizzes' })
   completedQuizzes: boolean;

   @Column({ type: 'numeric', default: 0, name: 'progress_percentage' })
   progressPercentage: number;

   @CreateDateColumn({ name: 'last_accessed_at', default: new Date() })
   lastAccessedAt: Date;

   @ManyToOne(() => CourseEntity, (course) => course.progress)
   course: CourseEntity;

   @ManyToOne(() => AccountEntity, (account) => account.progress)
   account: AccountEntity;

   @OneToMany(() => ProgresDetailsEntity, (progres) => progres.progres)
   details: ProgresDetailsEntity[];
}
