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
    return this.createQueryBuilder('variant')
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

  async findSoftDeletedVariants(options: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const { page = 1, limit = 10, search } = options;

    const qb = this.createQueryBuilder('variant')
      .withDeleted()
      .innerJoin('variant.product', 'product')
      .where('variant.deletedAt IS NOT NULL');

    if (search) {
      qb.andWhere('(variant.variantValue ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    qb.orderBy('variant.deletedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async removeSoftDeletedVariants(): Promise<void> {
    await this.createQueryBuilder()
      .delete()
      .from(ProductVariantEntity)
      .where('deleted_at IS NOT NULL')
      .execute();
  }
}
