import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../bases';
import { IQuizQuestionEntity } from '../interfaces';
import { CourseEntity } from './course.entity';

@Entity({ name: 'course_question' })
export class QuizQuestionEntity
   extends BaseEntity<QuizQuestionEntity>
   implements IQuizQuestionEntity
{
   @Column({ type: 'varchar', name: 'question_text' })
   questionText: string;

   @Column({ array: true, type: 'text', name: 'options' })
   options: string[];

   @Column({ type: 'boolean', name: 'correct_option', default: false })
   correctOption: boolean;

   @ManyToOne(() => CourseEntity, (course) => course.quiz)
   course: CourseEntity;
}
