import { Injectable } from '@nestjs/common';
import { ProductEntity } from 'src/database/entities/product.entity';
import { DataSource, IsNull } from 'typeorm';
import { BaseRepository } from '../base/base.repository';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { PaginateProductsDto } from 'src/shared/dto/product/paginate-products.dto';
import { ProductStatusEnum } from 'src/shared/enums/product.enum';
import { AdminPaginateProductsDto } from 'src/modules/admin/management/product/dto/admin-paginate-product.dto';

@Injectable()
export class ProductRepository extends BaseRepository<ProductEntity> {
  constructor(datasource: DataSource) {
    super(datasource, ProductEntity);
  }

  async findProductsPaginationUser(dto: PaginateProductsDto) {
    return this.findProductsPagination(dto);
  }

  async findProductsPaginationAdmin(dto: AdminPaginateProductsDto) {
    return this.findProductsPagination(dto);
  }

  async findProductsPagination(dto: any): Promise<Pagination<ProductEntity>> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;

    const qb = this.createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variant')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.category', 'category');

    if (dto.includeDeleted) {
      qb.withDeleted();
    }

    if (dto.status) {
      qb.andWhere('product.status = :status', {
        status: dto.status,
      });
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

    if (dto.minPrice !== undefined || dto.maxPrice !== undefined) {
      const priceSubQuery = this.createQueryBuilder('p')
        .select('p.id')
        .leftJoin('p.variants', 'v')
        .groupBy('p.id');

      if (dto.minPrice !== undefined) {
        priceSubQuery.having('MIN(v.price) >= :minPrice', {
          minPrice: dto.minPrice,
        });
      }

      if (dto.maxPrice !== undefined) {
        priceSubQuery.andHaving('MAX(v.price) <= :maxPrice', {
          maxPrice: dto.maxPrice,
        });
      }

      qb.andWhere(`product.id IN (${priceSubQuery.getQuery()})`).setParameters(
        priceSubQuery.getParameters(),
      );
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
        status: ProductStatusEnum.ACTIVE,
      },
      relations: ['variants', 'brand', 'category'],
    });
  }

  async findOneWithBrandAndCategory(id: string) {
    return await this.findOne({
      where: {
        id: id,
        status: ProductStatusEnum.ACTIVE,
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

  async findInactiveProduct(productId: string) {
    return this.findOne({
      where: { id: productId, status: ProductStatusEnum.INACTIVE },
      relations: ['variants'],
    });
  }
}
