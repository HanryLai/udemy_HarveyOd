import {
   Column,
   Entity,
   Index,
   JoinColumn,
   JoinTable,
   ManyToMany,
   OneToMany,
   OneToOne,
} from 'typeorm';
import { BaseEntity } from '../bases';
import { IAccountEntity } from '../interfaces';
import { KeyTokenEntity, LoginHistoryEntity, SessionEntity, RoleEntity } from '../auth';
import { DetailAccountEntity } from './detailAccount.entity';
import { CourseEntity, CourseProgressEntity, EnrollmentEntity } from '../courses';
import { ReviewEntity } from '../courses/review.entity';
import { CertificateEntity } from '../courses/certificate.entity';

@Entity({ name: 'account' })
export class AccountEntity extends BaseEntity<AccountEntity> implements IAccountEntity {
   @Index('IDX_ACCOUNT_USERNAME', { unique: true })
   @Column({ type: 'varchar', unique: true })
   username: string;

   @Index('IDX_ACCOUNT_EMAIL', { unique: true })
   @Column({ type: 'varchar', name: 'email' })
   email: string;

   @Column({ name: 'password', type: 'varchar' })
   password: string;

   @Column({ name: 'is_verified', type: 'boolean', default: false })
   isVerified: boolean;

   @Column({ name: 'last_login', type: 'timestamptz', default: null })
   lastLogin: Date;

   @ManyToMany(() => RoleEntity, { cascade: true })
   @JoinTable()
   roles: RoleEntity[];

   @OneToMany(() => SessionEntity, (session) => session.account)
   sessions: SessionEntity[];

   @OneToMany(() => KeyTokenEntity, (keyToken) => keyToken.account)
   keyToken: KeyTokenEntity[];

   /* The `@OneToMany(() => LoginHistoryEntity, (history) => history.account)` decorator in the
  `AccountEntity` class is defining a one-to-many relationship between the `AccountEntity` and
  `LoginHistoryEntity`. */
   @OneToMany(() => LoginHistoryEntity, (history) => history.account)
   loginHistory: LoginHistoryEntity[];

   @OneToOne(() => DetailAccountEntity, { cascade: true })
   @JoinColumn()
   detail: DetailAccountEntity;

   @OneToMany(() => EnrollmentEntity, (enrollment) => enrollment.account)
   enrollments: EnrollmentEntity[];

   @OneToMany(() => CourseEntity, (course) => course.instructor)
   courses: CourseEntity[];

   @OneToMany(() => CourseProgressEntity, (progres) => progres.course)
   progress: CourseProgressEntity[];

   @OneToMany(() => ReviewEntity, (review) => review.account)
   review: ReviewEntity[];

   @OneToMany(() => CertificateEntity, (certificate) => certificate.account)
   certificate: CertificateEntity[];
   account: KeyTokenEntity;
}
