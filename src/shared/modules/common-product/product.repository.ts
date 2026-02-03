import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../base/base.repository';
import { ProductEntity } from 'src/database/entities/product.entity';
import { DataSource } from 'typeorm';

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
    const {
      page = 1,
      limit = 10,
      search,
      filters = {},
    } = options;
  
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
      .where('product.isActive = :isActive', {
        isActive: filters.isActive ?? true,
      })
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
  
    const [raw, total] = await Promise.all([
      qb.getRawMany(),
      qb.getCount(),
    ]);
  
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
}
