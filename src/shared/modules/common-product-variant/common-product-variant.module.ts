import { BaseRepository } from '../base/base.repository';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ProductVariantEntity } from 'src/database/entities/product-variant.entity';

@Injectable()
export class ProductVariantRepository extends BaseRepository<ProductVariantEntity> {
  constructor(datasource: DataSource) {
    super(datasource, ProductVariantEntity);
  }

  async findByProduct(productId) {
    this.repository.find({
      where: { product: { id: productId } },
    });
  }
}
