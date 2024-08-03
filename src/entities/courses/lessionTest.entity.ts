import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../bases';
import { ILessionTest } from '../interfaces';
import { CourseLessonEntity } from './lesson.entity';

@Entity({ name: 'lession_tests' })
export class LessionTestEntity extends BaseEntity<LessionTestEntity> implements ILessionTest {
   @Column({ name: 'question', type: 'text', default: '' })
   question: string;

   @Column({ array: true, name: 'options', type: 'text' })
   options: string[];

   @Column({ name: 'correct_answer', type: 'text', default: '' })
   correctAnswer: string;

   @Column({ name: 'url_audio', type: 'text', default: '' })
   urlAudio: string;

   @OneToMany(() => CourseLessonEntity, (lesson) => lesson.lessonTest)
   lessons: CourseLessonEntity[];
}