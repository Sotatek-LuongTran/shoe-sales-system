import { Injectable } from '@nestjs/common';
import { ProductEntity } from 'src/database/entities/product.entity';
import { DataSource, IsNull } from 'typeorm';
import { BaseRepository } from '../base/base.repository';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { PaginateProductsDto } from 'src/shared/dto/product/paginate-products.dto';

@Injectable()
export class ProductRepository extends BaseRepository<ProductEntity> {
  constructor(datasource: DataSource) {
    super(datasource, ProductEntity);
  }

  async findProductsPagination(
    dto: PaginateProductsDto,
  ): Promise<Pagination<ProductEntity>> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;

    const qb = this.createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variant')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.category', 'category');

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
    if (dto.search) {
      qb.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${dto.search}%` },
      );
    }

    // Filters
    if (dto.gender) {
      qb.andWhere('product.gender = :gender', { gender: dto.gender });
    }

    if (dto.productType) {
      qb.andWhere('product.productType = :productType', {
        productType: dto.productType,
      });
    }

    if (dto.brandId) {
      qb.andWhere('product.brandId = :brandId', {
        brandId: dto.brandId,
      });
    }

    if (dto.categoryId) {
      qb.andWhere('product.categoryId = :categoryId', {
        categoryId: dto.categoryId,
      });
    }

    // Price range filtering (AGGREGATE → HAVING)
    if (dto.minPrice !== undefined) {
      qb.having('MIN(variant.price) >= :minPrice', {
        minPrice: dto.minPrice,
      });
    }

    if (dto.maxPrice !== undefined) {
      qb.andHaving('MAX(variant.price) <= :maxPrice', {
        maxPrice: dto.maxPrice,
      });
    }

    qb.orderBy('product.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return paginate(qb, { page, limit });
  }

  async findProductWithVariants(id: string) {
    return this.findOne({
      where: {
        id,
      },
      relations: ['variants', 'brand', 'category']
    });
  }

  async findOneWithBrandAndCategory(id: string) {
    return await this.findOne({
      where: {
        id: id,
        deletedAt: IsNull(),
      },
      relations: ['brand', 'category'],
    });
  }

  async removeSoftDeletedProducts(): Promise<void> {
    await this.createQueryBuilder()
      .delete()
      .from(ProductEntity)
      .where('deleted_at IS NOT NULL')
      .execute();
  }
}
