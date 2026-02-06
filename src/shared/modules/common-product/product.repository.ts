import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../base/base.repository';
import { ProductEntity } from 'src/database/entities/product.entity';
import { DataSource, IsNull } from 'typeorm';

@Injectable()
export class ProductRepository extends BaseRepository<ProductEntity> {
  constructor(datasource: DataSource) {
    super(datasource, ProductEntity);
  }

  async findProductsPaginationWithPriceRange(options: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: {
      gender?: string;
      productType?: string;
      brandId?: string;
      categoryId?: string;
      isActive?: boolean;
      minPrice?: number;
      maxPrice?: number;
    };
  }) {
    const { page = 1, limit = 10, search, filters = {} } = options;

    const qb = this.repository
      .createQueryBuilder('product')
      .leftJoin('product.variants', 'variant')
      .select([
        'product.id AS id',
        'product.name AS name',
        'product.description AS description',
        'product.gender AS gender',
        'product.productType AS productType',
        'product.createdAt AS createdAt',
        'MIN(variant.price) AS minPrice',
        'MAX(variant.price) AS maxPrice',
      ])
      .leftJoin('product.brand', 'brand')
      .leftJoin('product.category', 'category')
      .where('product.isActive = :isActive', {
        isActive: filters.isActive ?? true,
      })
      .andWhere('product.deletedAt IS NULL')
      .andWhere('brand.deletedAt IS NULL')
      .andWhere('category.deletedAt IS NULL')
      .groupBy('product.id');

    // Search
    if (search) {
      qb.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filters
    if (filters.gender) {
      qb.andWhere('product.gender = :gender', { gender: filters.gender });
    }

    if (filters.productType) {
      qb.andWhere('product.productType = :productType', {
        productType: filters.productType,
      });
    }

    if (filters.brandId) {
      qb.andWhere('product.brandId = :brandId', {
        brandId: filters.brandId,
      });
    }

    if (filters.categoryId) {
      qb.andWhere('product.categoryId = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    // Price range filtering (AGGREGATE → HAVING)
    if (filters.minPrice !== undefined) {
      qb.having('MIN(variant.price) >= :minPrice', {
        minPrice: filters.minPrice,
      });
    }

    if (filters.maxPrice !== undefined) {
      qb.andHaving('MAX(variant.price) <= :maxPrice', {
        maxPrice: filters.maxPrice,
      });
    }

    qb.orderBy('product.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [raw, total] = await Promise.all([qb.getRawMany(), qb.getCount()]);

    return {
      data: raw.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        gender: row.gender,
        productType: row.producttype,
        priceRange: {
          min: Number(row.minprice),
          max: Number(row.maxprice),
        },
        deleteAt: row.deleteAt,
        createdAt: row.createdat,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findProductWithPriceRange(id: string) {
    const product = await this.repository
      .createQueryBuilder('product')
      .leftJoin('product.variants', 'variant')
      .select([
        'product',
        'MIN(variant.price) AS minPrice',
        'MAX(variant.price) AS maxPrice',
      ])
      .where('product.id = :id', { id })
      .groupBy('product.id')
      .getRawAndEntities();

    return product;
  }

  async findOneWithBrandAndCategory(id: string) {
    return await this.repository.findOne({
      where: {
        id: id,
        deletedAt: IsNull(),
      },
      relations: ['brand', 'category'],
    });
  }

  async findSoftDeletedProducts(options: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const { page = 1, limit = 10, search } = options;

    const qb = this.repository
      .createQueryBuilder('product')
      .withDeleted()
      .leftJoin('product.brand', 'brand', 'brand.deletedAt IS NULL')
      .leftJoin('product.category', 'category', 'category.deletedAt IS NULL')
      .where('product.deletedAt IS NOT NULL');

    if (search) {
      qb.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('product.deletedAt', 'DESC')
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

  async removeSoftDeletedProducts(): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .delete()
      .from(ProductEntity)
      .where('deleted_at IS NOT NULL')
      .execute();
  }
}
