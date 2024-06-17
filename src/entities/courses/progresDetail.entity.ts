import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../bases';
import { IProgressDetailEntity } from '../interfaces';
import { CourseProgressEntity } from './progres.entity';
import { CourseContentEntity } from './content.entity';

@Entity({ name: 'course_progress_detail' })
export class ProgresDetailsEntity
   extends BaseEntity<ProgresDetailsEntity>
   implements IProgressDetailEntity
{
   @Column({ type: 'varchar', name: 'content_type' })
   contentType: string;

   @Column({ type: 'boolean', default: false, name: 'is_completed' })
   isCompleted: boolean;

   @ManyToOne(() => CourseProgressEntity, (progres) => progres.details)
   progres: CourseProgressEntity;

   @ManyToOne(() => CourseContentEntity, (content) => content.details)
   content: CourseContentEntity;
}
