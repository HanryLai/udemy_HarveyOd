import { IBaseEntity } from './base.entity.interface';

export interface ITwoFaSettingEntity extends IBaseEntity {
   twoFaEnabled: boolean;
   twoFaSecret: string;
   twoFaRecoveryCodes: string[];
   twoFaRecoveryCodesUsed: string[];
   twoFaRecoveryCodesGeneratedAt: Date;
   twoFaRecoveryCodesUsedAt: Date;
   twoFaRecoveryCodesLimit: number;
}