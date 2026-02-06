import { BaseRepository } from '../base/base.repository';
import { DataSource, IsNull } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ProductVariantEntity } from 'src/database/entities/product-variant.entity';

@Injectable()
export class ProductVariantRepository extends BaseRepository<ProductVariantEntity> {
  constructor(datasource: DataSource) {
    super(datasource, ProductVariantEntity);
  }

  async findByProductAndVariant(
    productId: string,
    variantValue: string,
  ): Promise<ProductVariantEntity | null> {
    return this.repository
      .createQueryBuilder('variant')
      .innerJoin('variant.product', 'product')
      .innerJoin('product.brand', 'brand')
      .innerJoin('product.category', 'category')
      .where('variant.productId = :productId', { productId })
      .andWhere('variant.variantValue = :variantValue', { variantValue })
      .andWhere('variant.isActive = true')
      .andWhere('variant.deletedAt IS NULL')
      .andWhere('product.deletedAt IS NULL')
      .andWhere('brand.deletedAt IS NULL')
      .andWhere('category.deletedAt IS NULL')
      .getOne();
  }
}
