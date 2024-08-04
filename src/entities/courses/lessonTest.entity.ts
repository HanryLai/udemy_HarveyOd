import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../bases';

import { CourseLessonEntity } from './lesson.entity';
import { ILessonTest } from '../interfaces';

@Entity({ name: 'lesson_tests' })
export class LessonTestEntity extends BaseEntity<LessonTestEntity> implements ILessonTest {
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