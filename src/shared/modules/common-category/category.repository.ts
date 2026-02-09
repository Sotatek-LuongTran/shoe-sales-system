import { BaseRepository } from '../base/base.repository';
import { DataSource, IsNull } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryEntity } from 'src/database/entities/category.entity';
import { ProductEntity } from 'src/database/entities/product.entity';

@Injectable()
export class CategoryRepository extends BaseRepository<CategoryEntity> {
  constructor(datasource: DataSource) {
    super(datasource, CategoryEntity);
  }

  async findByName(name: string) {
    return this.findOne({
      where: {
        name,
      },
    });
  }

  async findSoftDeletedCategories(options: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const { page = 1, limit = 10, search } = options;

    const qb = this.createQueryBuilder('category')
      .withDeleted()
      .where('category.deletedAt IS NOT NULL');

    if (search) {
      qb.andWhere(
        '(category.name ILIKE :search OR category.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('category.deletedAt', 'DESC')
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

  async removeSoftDeletedCategories(): Promise<void> {
    await this.manager.transaction(async (manager) => {
      // Find soft-deleted categories
      const deletedCategories = await manager
        .createQueryBuilder(CategoryEntity, 'category')
        .withDeleted()
        .where('category.deletedAt IS NOT NULL')
        .select(['category.id'])
        .getMany();

      if (!deletedCategories.length) return;

      const categoryIds = deletedCategories.map((c) => c.id);

      // HARD delete products under those categories
      await manager
        .createQueryBuilder()
        .delete()
        .from(ProductEntity)
        .where('categoryId IN (:...categoryIds)', { categoryIds })
        .execute();

      // HARD delete categories
      await manager
        .createQueryBuilder()
        .delete()
        .from(CategoryEntity)
        .where('id IN (:...categoryIds)', { categoryIds })
        .execute();
    });
  }

  async removeOneSoftDeletedCategory(categoryId: string): Promise<void> {
    await this.manager.transaction(async (manager) => {
      // HARD delete products under this category
      await manager
        .createQueryBuilder()
        .delete()
        .from(ProductEntity)
        .where('categoryId = :categoryId', { categoryId })
        .execute();

      // HARD delete the category
      await manager
        .createQueryBuilder()
        .delete()
        .from(CategoryEntity)
        .where('id = :categoryId', { categoryId })
        .execute();
    });
  }
}
