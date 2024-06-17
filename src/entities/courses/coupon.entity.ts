import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BaseEntity } from '../bases';
import { ICouponEntity } from '../interfaces';
import { CourseEntity } from './course.entity';

@Entity({ name: 'coupon' })
export class CouponEntity extends BaseEntity<CouponEntity> implements ICouponEntity {
   @Column({ type: 'varchar', name: 'code' })
   code: string;
   @Column({ type: 'int', name: 'discount_percentage' })
   discountPercentage: number;
   @CreateDateColumn({ name: 'expiration_date' })
   expirationDate: Date;

   @ManyToMany(() => CourseEntity, { cascade: true })
   @JoinTable()
   courses: CourseEntity[];
}
