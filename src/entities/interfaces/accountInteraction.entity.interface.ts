import { IBaseEntity } from './base.entity.interface';

export interface IInteractionEntity extends IBaseEntity {
   interactionType: string;
   interactionDate: Date;
}