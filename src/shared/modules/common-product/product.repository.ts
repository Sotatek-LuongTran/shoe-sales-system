import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../base/base.repository';
import { ProductEntity } from 'src/database/entities/product.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class ProductRepository extends BaseRepository<ProductEntity> {
  constructor(datasource: DataSource) {
    super(datasource, ProductEntity);
  }

  async findAllByBrand(brandId: string) {
    return this.repository.find({
      where: {
        brandId,
        isActive: true,
      }
    });
  }
  
}
