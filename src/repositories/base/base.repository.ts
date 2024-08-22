import { EntityManager, EntityTarget, Repository } from 'typeorm';

export class BaseRepository<T> extends Repository<T> {
   constructor(
      private readonly entityClass: EntityTarget<T>,
      private readonly entityManager: EntityManager,
   ) {
      super(entityClass, entityManager);
   }
}
