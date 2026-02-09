import { BaseRepository } from '../base/base.repository';
import { DataSource, IsNull } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ProductVariantEntity } from 'src/database/entities/product-variant.entity';
import { PaginateVariantsDto } from 'src/modules/product-variant/dto/paginate-variants.dto';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { groupBy } from 'rxjs';

@Injectable()
export class ProductVariantRepository extends BaseRepository<ProductVariantEntity> {
  constructor(datasource: DataSource) {
    super(datasource, ProductVariantEntity);
  }

  async findVariantsPagination(
    productId: string,
    dto: PaginateVariantsDto,
  ): Promise<Pagination<PaginateVariantsDto>> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;

    const qb = this.createQueryBuilder('variant')
      .innerJoin('variant.product', 'product')
      .innerJoin('product.brand', 'brand')
      .innerJoin('product.category', 'category')
      .where('variant.productId = :productId', { productId })
      .andWhere('variant.variantValue = :variantValue', {
        variantValue: dto.variantValue,
      });

    if (dto.includeDeleted) {
      qb.withDeleted();
    }
    if (dto.isActive !== undefined) {
      qb.andWhere('product.isActive = :isActive', {
        isActive: dto.isActive,
      });
    } else if (!dto.includeDeleted) {
      qb.andWhere('product.isActive = true');
    }
    qb.groupBy('variant.id');

    if (dto.variantValue) {
      qb.andWhere('variant.variantValue ILIKE :search', {
        search: `%${dto.search}%`,
      });
    }

    if (dto.stock) {
      qb.andWhere('variant.stock >= :stock', { stock: `%${dto.stock}%` });
    }

    if (dto.price) {
      qb.andWhere('variant.stock <= :price', { price: `%${dto.price}%` });
    }

    qb.orderBy('product.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    return paginate(qb, { page, limit });
  }

  async removeSoftDeletedVariants(): Promise<void> {
    await this.createQueryBuilder()
      .delete()
      .from(ProductVariantEntity)
      .where('deleted_at IS NOT NULL')
      .execute();
  }

  async findByProductAndValue(productId: string, variantValue: string) {
    return this.createQueryBuilder('variant')
      .innerJoin('variant.product', 'product')
      .where('variant.productId = :productId', { productId })
      .andWhere('variant.variantValue = :variantValue', { variantValue })
      .andWhere('variant.isActive = true')
      .getOne();
  }
}
