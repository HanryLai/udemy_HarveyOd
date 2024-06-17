export interface IBaseEntity {
   id: string;
   createAt: Date;
   updateAt: Date;
   isActive: boolean;
   isArchived: boolean;
   createBy: string;
}