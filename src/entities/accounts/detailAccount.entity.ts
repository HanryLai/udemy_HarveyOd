import { Column, CreateDateColumn, Entity } from 'typeorm';
import { BaseEntity } from '../bases';
import { IDetailAccount } from '../interfaces';
import { EGender } from 'src/constants';

@Entity({ name: 'detail_account' })
export class DetailAccountEntity extends BaseEntity<DetailAccountEntity> implements IDetailAccount {
   @Column({ type: 'varchar', name: 'full_name' })
   fullName: string;

   @CreateDateColumn({ name: 'birth_date', type: 'date' })
   birthDate: Date;

   @Column({ type: 'enum', enum: EGender, default: EGender.other })
   gender: EGender;

   @Column({ type: 'varchar', default: '' })
   avatar: string;

   @Column({ type: 'varchar', length: 10, default: '' })
   phone: string;

   @Column({ type: 'varchar', default: '' })
   bio: string;
}
