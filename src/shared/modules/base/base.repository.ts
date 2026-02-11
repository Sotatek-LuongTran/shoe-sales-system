import { Repository, EntityTarget, DataSource } from 'typeorm';
import { BaseEntity } from './base.entity';

export abstract class BaseRepository<T extends BaseEntity> extends Repository<T> {
  protected constructor(
    protected readonly dataSource: DataSource,
    entity: EntityTarget<T>,
  ) {
    super(entity, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<T | null> {
    return this.findOne({ where: { id } as any });
  }
}
