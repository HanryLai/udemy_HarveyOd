import { Column, CreateDateColumn, Entity, ManyToOne } from 'typeorm';

import { AccountEntity } from '../accounts';
import { BaseEntity } from '../bases';
import { ILoginHistory } from '../interfaces';

@Entity({ name: 'login_history' })
export class LoginHistoryEntity extends BaseEntity<LoginHistoryEntity> implements ILoginHistory {
   @CreateDateColumn({ name: 'login_time' })
   loginTime: Date;

   @Column({ type: 'varchar', name: 'login_method', default: 'email' })
   loginMethod: string;

   @Column({ type: 'varchar', name: 'ip_address' })
   ipAddress: string;

   @Column({ type: 'varchar', name: 'user_agent' })
   userAgent: string;

   @ManyToOne(() => AccountEntity, (account) => account.loginHistory)
   account: AccountEntity;
}
