import { Column, Entity, Index, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../bases';
import { ICourse } from '../interfaces';

import { AccountEntity } from '../accounts/account.entity';

import { CourseContentEntity } from './content.entity';
import { CourseModuleEntity } from './module.entity';
import { CategoryEntity } from './category.entity';
import { CourseProgressEntity } from './progres.entity';
import { EnrollmentEntity } from './enrollment.entity';
import { ReviewEntity } from './review.entity';
import { AssignmentEntity } from './assignment.entity';
import { QuizQuestionEntity } from './question.entity';
import { InteractionEntity } from './interaction.entity';
import { CourseType } from 'src/constants/enums/course-type.enum.constant';

@Entity({ name: 'course' })
export class CourseEntity extends BaseEntity<CourseEntity> implements ICourse {
   @Index('IDX_COURSE_TITLE')
   @Column({ type: 'varchar', default: '', name: 'title' })
   title: string;

   @Column({ type: 'varchar', default: '', name: 'description' })
   description: string;

   @Column({ array: true, type: 'text', name: 'language' })
   language: string[];

   @Column({ type: 'numeric', default: 0, name: 'price' })
   price: number;

   @Column({ type: 'varchar', default: '', name: 'level' })
   level: string;

   @Column({ type: 'numeric', default: 0, name: 'discount' })
   discount: number;

   @Column({ type: 'varchar', default: '', name: 'thunbnailUrl' })
   thunbnailUrl: string;

   @Column({
      type: 'enum',
      enum: CourseType,
      default: CourseType.DRAFT,
   })
   type: CourseType;

   @OneToMany(() => EnrollmentEntity, (enrollment) => enrollment.course)
   enrollments: EnrollmentEntity[];

   @ManyToOne(() => AccountEntity, (account) => account.courses)
   instructor: AccountEntity;

   @ManyToMany(() => CategoryEntity, { cascade: true })
   @JoinTable()
   categories: CategoryEntity[];

   @OneToMany(() => CourseProgressEntity, (progres) => progres.course)
   progress: CourseProgressEntity;

   @OneToMany(() => CourseContentEntity, (content) => content.course)
   contents: CourseContentEntity[];

   @OneToMany(() => CourseModuleEntity, (module) => module.course)
   modules: CourseModuleEntity[];

   @OneToMany(() => ReviewEntity, (review) => review.course)
   reviews: ReviewEntity[];

   @OneToMany(() => AssignmentEntity, (assignment) => assignment.course)
   assignments: AssignmentEntity[];

   @OneToMany(() => QuizQuestionEntity, (quiz) => quiz.course)
   quiz: QuizQuestionEntity[];

   @ManyToOne(() => InteractionEntity, (interaction) => interaction.course)
   interaction: InteractionEntity;
}
