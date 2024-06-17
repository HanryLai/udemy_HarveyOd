import { Column, CreateDateColumn, Entity, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from '../bases';
import { ICertificateEntity } from '../interfaces';
import { AccountEntity } from '../accounts';
import { CourseEntity } from './course.entity';

@Entity({ name: 'certificate' })
export class CertificateEntity extends BaseEntity<CertificateEntity> implements ICertificateEntity {
   @CreateDateColumn({ name: 'issue_date' })
   issueDate: Date;

   @Column({ type: 'int', name: 'grade' })
   grade: number;

   @Column({ type: 'varchar', name: 'certificate_url' })
   certificateUrl: string;

   @ManyToOne(() => AccountEntity, (account) => account.certificate)
   account: AccountEntity;

   @OneToOne(() => CourseEntity, { cascade: true })
   course: CourseEntity;
}
