import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../bases';
import { ICategory } from '../interfaces';

@Entity({ name: 'category' })
export class CategoryEntity
   extends BaseEntity<CategoryEntity>
   implements ICategory
{
   @Column({ type: 'varchar', name: 'category_name', unique: true })
   name: string;

   @Column({ type: 'varchar', name: 'category_description' })
   description: string;
}
