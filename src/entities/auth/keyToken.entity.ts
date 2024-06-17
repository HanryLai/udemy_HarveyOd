import { Column, Entity, ManyToOne } from 'typeorm';
import { IKeyTokenEntity } from '../interfaces';
import { BaseEntity } from '../bases';
import { AccountEntity } from '../accounts';

@Entity({ name: 'key_token' })
export class KeyTokenEntity extends BaseEntity<KeyTokenEntity> implements IKeyTokenEntity {
   @Column({ type: 'varchar', default: '' })
   privateKey: string;

   @Column({ type: 'varchar', default: '' })
   publicKey: string;

   @Column({ type: 'varchar', default: '' })
   refreshToken: string;

   @Column({ type: 'text', default: [], array: true })
   refreshTokenUsed: string[];

   @ManyToOne(() => AccountEntity, (account) => account.keyToken)
   account: AccountEntity;
}
