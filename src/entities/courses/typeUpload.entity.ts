import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../bases';
import { ITypeUpload } from '../interfaces';
import { CourseLessonEntity } from './lesson.entity';

@Entity({ name: 'type_uploads' })
export class TypeUploadEntity extends BaseEntity<TypeUploadEntity> implements ITypeUpload {
   @Column({ name: 'type', type: 'varchar', default: '' })
   type: string;

   @Column({ name: 'description', type: 'text', default: '' })
   description: string;

   @Column({ name: 'url', type: 'text', default: '' })
   url: string;

   @Column({ name: 'duration', type: 'int', default: 0 })
   duration: number;

   @OneToMany(() => CourseLessonEntity, (lesson) => lesson.typeUpload)
   lesson: CourseLessonEntity[];


}