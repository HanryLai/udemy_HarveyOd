import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../bases';
import { IRole } from '../interfaces';

@Entity({ name: 'roles' })
export class RoleEntity extends BaseEntity<RoleEntity> implements IRole {
   @Column({ type: 'varchar', default: '' })
   name: string;

   @Column({ type: 'varchar', default: '' })
   description: string;
   
   @Column({ type: 'varchar', default: '' })
   permissions: string[];
}
