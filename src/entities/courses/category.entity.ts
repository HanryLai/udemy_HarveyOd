import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BaseEntity } from '../bases';
import { ICategory } from '../interfaces';
import { CourseEntity } from './course.entity';

@Entity({ name: 'category' })
export class CategoryEntity extends BaseEntity<CategoryEntity> implements ICategory {
   @Column({ type: 'varchar', name: 'category_name', unique: true })
   name: string;

   @Column({ type: 'varchar', name: 'category_description' })
   description: string;

   @ManyToMany(() => CourseEntity, { cascade: true })
   @JoinTable()
   courses: CourseEntity[];
}
