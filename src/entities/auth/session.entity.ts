import { Column, Entity, ManyToOne } from 'typeorm';

import { AccountEntity } from '../accounts';
import { BaseEntity } from '../bases';
import { ISessionEntity } from '../interfaces';

@Entity({ name: 'sessions' })
export class SessionEntity extends BaseEntity<SessionEntity> implements ISessionEntity {
   @Column({ type: 'varchar', default: '' })
   refreshToken: string;
   @Column({ type: 'varchar', default: '' })
   accessToken: string;

   @Column({ type: 'varchar', default: '' })
   publicKey: string;

   @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
   expiresAt: Date;

   @ManyToOne(() => AccountEntity, (account) => account.sessions)
   account: AccountEntity;
}
