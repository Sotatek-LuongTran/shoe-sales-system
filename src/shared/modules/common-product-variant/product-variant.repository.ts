import { BaseRepository } from '../base/base.repository';
import { DataSource, IsNull } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ProductVariantEntity } from 'src/database/entities/product-variant.entity';
import { PaginateVariantsDto } from 'src/shared/dto/product-variant/paginate-variants.dto';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { groupBy } from 'rxjs';
import { VariantStatusEnum } from 'src/shared/enums/product-variant.enum';
import { AdminPaginateVariantsDto } from 'src/modules/admin/management/product-variant/dto/admin-paginate-variant.dto';

@Injectable()
export class ProductVariantRepository extends BaseRepository<ProductVariantEntity> {
  constructor(datasource: DataSource) {
    super(datasource, ProductVariantEntity);
  }

  async findVariantsPaginationUser(
    productId: string,
    dto: PaginateVariantsDto,
  ) {
    return this.findVariantsPagination(productId, dto);
  }

  async findVariantsPaginationAdmin(
    productId: string,
    dto: AdminPaginateVariantsDto,
  ) {
    return this.findVariantsPagination(productId, dto);
  }

  async findVariantsPagination(productId: string, dto: any) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;

    const qb = this.createQueryBuilder('variant').where(
      'variant.productId = :productId',
      { productId },
    );
    if (dto.variantValue) {
      qb.andWhere('variant.variantValue = :variantValue', {
        variantValue: dto.variantValue,
      });
    }

    if (dto.includeDeleted) {
      qb.withDeleted();
    }

    if (dto.variantValue) {
      qb.andWhere('variant.variantValue ILIKE :search', {
        search: dto.search,
      });
    }

    if (dto.stock) {
      qb.andWhere('variant.stock >= :stock', { stock: dto.stock });
    }

    if (dto.price) {
      qb.andWhere('variant.stock <= :price', { price: dto.price });
    }

    qb.orderBy('variant.createdAt', 'DESC')
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
      .setLock('pessimistic_write')
      .innerJoin('variant.product', 'product')
      .where('variant.productId = :productId', { productId })
      .andWhere('variant.variantValue = :variantValue', { variantValue })
      .getOne();
  }

  async findInactiveVariant(variantId: string) {
    return this.findOne({
      where: {
        id: variantId,
        status: VariantStatusEnum.INACTIVE,
      },
    });
  }

  async findVariantWithProduct(variantId: string) {
    return this.findOne({
      where: {
        id: variantId,
        status: VariantStatusEnum.ACTIVE,
      },
      relations: ['product'],
    });
  }
}
