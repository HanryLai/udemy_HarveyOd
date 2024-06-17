import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { ITagEntity } from '../interfaces';
import { BaseEntity } from '../bases';
import { CourseEntity } from './course.entity';

@Entity({ name: 'tag' })
export class TagEntity extends BaseEntity<TagEntity> implements ITagEntity {
   @Column({ type: 'varchar', name: 'name' })
   name: string;
   @Column({ type: 'varchar', name: 'description' })
   description: string;

   @ManyToMany(() => CourseEntity, { cascade: true })
   @JoinTable()
   courses: CourseEntity[];
}
