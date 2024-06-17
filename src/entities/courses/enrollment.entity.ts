import { CreateDateColumn, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../bases';
import { IEnrollmentEntity } from '../interfaces';
import { AccountEntity } from '../accounts';
import { CourseEntity } from '../courses';

@Entity({ name: 'enrollment' })
export class EnrollmentEntity extends BaseEntity<EnrollmentEntity> implements IEnrollmentEntity {
    @CreateDateColumn({ name: 'enrollment_date' })
    enrollmentDate: Date;

    @ManyToOne(() => AccountEntity, (account) => account.enrollments)
    account: AccountEntity;

    @ManyToOne(() => CourseEntity, (course) => course.enrollments)
    course: CourseEntity;
}
