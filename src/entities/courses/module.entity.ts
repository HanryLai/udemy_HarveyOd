import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../bases';
import { IModuleEntity } from '../interfaces';
import { CourseEntity } from './course.entity';
import { CourseLessonEntity } from './lesson.entity';

@Entity({ name: 'course_module' })
export class CourseModuleEntity extends BaseEntity<CourseModuleEntity> implements IModuleEntity {
   @Column({ name: 'module_title', type: 'varchar' })
   title: string;

   @Column({ name: 'module_description', type: 'varchar' })
   description: string;

   @Column({ name: 'module_index', type: 'int' })
   orderIndex: number;

   @Column({ name: 'is_published', type: 'boolean' })
   isPublished: boolean;

   @Column({ name: 'is_deleted', type: 'boolean', default: false })
   isDeleted: boolean;

   @ManyToOne(() => CourseEntity, (course) => course.modules)
   course: CourseEntity;

   @OneToMany(() => CourseLessonEntity, (lesson) => lesson.module)
   lessons: CourseLessonEntity[];
}
