import { BrandEntity } from 'src/database/entities/brand.entity';
import { BaseRepository } from '../base/base.repository';
import { DataSource, IsNull } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ProductEntity } from 'src/database/entities/product.entity';

@Injectable()
export class BrandRepository extends BaseRepository<BrandEntity> {
  constructor(datasource: DataSource) {
    super(datasource, BrandEntity);
  }

  async findByName(name: string) {
    return this.findOne({
      where: {
        name,
      },
    });
  }

  async findSoftDeletedBrands(options: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const { page = 1, limit = 10, search } = options;

    const qb = this
      .createQueryBuilder('brand')
      .withDeleted()
      .where('brand.deletedAt IS NOT NULL');

    if (search) {
      qb.andWhere(
        '(brand.name ILIKE :search OR brand.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('brand.deletedAt', 'DESC')
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

  async removeSoftDeletedBrands(): Promise<void> {
    await this.manager.transaction(async (manager) => {
      const deletedBrands = await manager
        .createQueryBuilder(BrandEntity, 'brand')
        .withDeleted()
        .where('brand.deletedAt IS NOT NULL')
        .select(['brand.id'])
        .getMany();
  
      if (!deletedBrands.length) return;
  
      const brandIds = deletedBrands.map((b) => b.id);
  
      await manager
        .createQueryBuilder()
        .delete()
        .from(ProductEntity)
        .where('brandId IN (:...brandIds)', { brandIds })
        .execute();
  
      await manager
        .createQueryBuilder()
        .delete()
        .from(BrandEntity)
        .where('id IN (:...brandIds)', { brandIds })
        .execute();
    });
  }
  async removeOneSoftDeletedBrand(brandId: string): Promise<void> {
    await this.manager.transaction(async (manager) => {
      // HARD delete products under this brand
      await manager
        .createQueryBuilder()
        .delete()
        .from(ProductEntity)
        .where('brandId = :brandId', { brandId })
        .execute();

      // HARD delete the brand
      await manager
        .createQueryBuilder()
        .delete()
        .from(BrandEntity)
        .where('id = :brandId', { brandId })
        .execute();
    });
  }
}
