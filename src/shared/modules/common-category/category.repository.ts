import { BaseRepository } from '../base/base.repository';
import { DataSource, IsNull } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CategoryEntity } from 'src/database/entities/category.entity';

@Injectable()
export class CategoryRepository extends BaseRepository<CategoryEntity> {
  constructor(datasource: DataSource) {
    super(datasource, CategoryEntity);
  }

  async findByName(name: string) {
    return this.repository.findOne({
      where: {
        name,
      },
    });
  }
}
