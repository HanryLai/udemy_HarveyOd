import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from '../bases';
import { ILesson } from '../interfaces';
import { CourseModuleEntity } from './module.entity';
import { TypeUploadEntity } from './typeUpload.entity';
import { LessionTestEntity } from './lessionTest.entity';

@Entity({ name: 'course_lesson' })
export class CourseLessonEntity extends BaseEntity<CourseLessonEntity> implements ILesson {
   @Index('IDX_COURSE_LESSON')
   @Column({ type: 'varchar', name: 'lesson_title' })
   title: string;

   @Column({ type: 'varchar', name: 'lesson_content' })
   content: string;

   @Column({ type: 'varchar', name: 'lesson_video_url' })
   videoUrl: string;

   @Column({ type: 'varchar', name: 'lesson_duration' })
   duration: string;

   @Column({ type: 'int', name: 'lesson_order_index' })
   orderIndex: number;

   @ManyToOne(() => CourseModuleEntity, (module) => module.lessions)
   module: CourseModuleEntity;

   @OneToOne(() => TypeUploadEntity, { cascade: true })
   @JoinColumn()
   typeUpload: TypeUploadEntity;

   @ManyToOne(() => LessionTestEntity, (lesson) => lesson.lessons)
   lessonTest: LessionTestEntity;
}
