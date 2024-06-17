import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../bases';
import { ICourseContentEntity } from '../interfaces';
import { ProgresDetailsEntity } from './progresDetail.entity';
import { CourseEntity } from './course.entity';

@Entity({ name: 'course_content' })
export class CourseContentEntity
   extends BaseEntity<CourseContentEntity>
   implements ICourseContentEntity
{
   @Column({ type: 'varchar', name: 'content_title' })
   title: string;

   @Column({ type: 'varchar', name: 'content_description' })
   description: string;

   @Column({ type: 'varchar', name: 'content_data' })
   contentData: string;

   @Column({ type: 'int', name: 'order_index' })
   orderIndex: number;

   @OneToMany(() => ProgresDetailsEntity, (progresDetail) => progresDetail.content)
   details: ProgresDetailsEntity[];

   @ManyToOne(() => CourseEntity, (course) => course.contents)
   course: CourseEntity;
}
