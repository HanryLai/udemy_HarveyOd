import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../bases';
import { ITypeUploadEntity } from '../interfaces';
import { CourseLessonEntity } from './lesson.entity';

@Entity({ name: 'type_upload' })
export class TypeUploadEntity extends BaseEntity<TypeUploadEntity> implements ITypeUploadEntity {
   @Column({ array: true, type: 'text', name: 'type' })
   type: string[];
   @Column({ type: 'varchar', name: 'description' })
   description: string;
   @Column({ type: 'varchar', name: 'url' })
   url: string;
   @Column({ type: 'int', name: 'duration' })
   duration: number;

   @OneToMany(() => CourseLessonEntity, (lesson) => lesson.typeUpload)
   lessons: CourseLessonEntity[];
}
