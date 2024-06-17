import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../bases';
import { IInteractionEntity } from '../interfaces';
import { CourseEntity } from './course.entity';

@Entity({ name: 'course_interaction' })
export class InteractionEntity extends BaseEntity<InteractionEntity> implements IInteractionEntity {
   @Column({ type: 'varchar', name: 'interaction_type' })
   interactionType: string;

   @Column({ type: 'varchar', name: 'interaction_content' })
   interactionDate: Date;

   @OneToMany(() => CourseEntity, (course) => course.interaction)
   course: CourseEntity[];
}
