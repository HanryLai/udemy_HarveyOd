import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from '../bases';
import { ILesson } from '../interfaces';
import { CourseModuleEntity } from './module.entity';
import { LessonTestEntity } from './lessonTest.entity';

@Entity({ name: 'course_lesson' })
export class CourseLessonEntity extends BaseEntity<CourseLessonEntity> implements ILesson {
   @Index('IDX_COURSE_LESSION')
   @Column({ type: 'varchar', name: 'lession_title' })
   title: string;

   @Column({ type: 'varchar', name: 'lession_content' })
   content: string;

   @Column({ type: 'varchar', name: 'lession_video_url' })
   videoUrl: string;

   @Column({ type: 'varchar', name: 'lession_duration' })
   duration: string;

   @Column({ type: 'int', name: 'lession_order_index' })
   orderIndex: number;

   @ManyToOne(() => CourseModuleEntity, (module) => module.lessions)
   module: CourseModuleEntity;

   @ManyToOne(() => LessonTestEntity, (lessonTest) => lessonTest.lessons)
   lessonTest: LessonTestEntity;
}
