import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from '../bases';
import { ILessonTestEntity } from '../interfaces';
import { CourseLessonEntity } from './lesson.entity';

@Entity({ name: 'lession_test' })
export class LessonTestEntity extends BaseEntity<LessonTestEntity> implements ILessonTestEntity {
   @Column({ type: 'varchar', name: 'question_text' })
   questionText: string;

   @Column({ array: true, type: 'text', name: 'options' })
   options: string[];

   @Column({ type: 'varchar', name: 'correct_option' })
   correctOption: string;
   @Column({ type: 'varchar', name: 'url_audio' })
   urlAudio: string;

   @ManyToOne(() => CourseLessonEntity, (lesson) => lesson.lessonTest)
   lessons: CourseLessonEntity;
}
