import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../bases';
import { IReviewEntity } from '../interfaces';
import { CourseEntity } from './course.entity';
import { AccountEntity } from '../accounts';

@Entity({ name: 'reviews' })
export class ReviewEntity extends BaseEntity<ReviewEntity> implements IReviewEntity {
   @Column({ name: 'rating', type: 'float', default: 0 })
   rating: number;

   @Column({ name: 'comment', type: 'text', nullable: true })
   comment: string;

   @ManyToOne(() => CourseEntity, (course) => course.reviews)
   course: CourseEntity;

   @ManyToOne(() => AccountEntity, (account) => account.review)
   account: AccountEntity;
}
