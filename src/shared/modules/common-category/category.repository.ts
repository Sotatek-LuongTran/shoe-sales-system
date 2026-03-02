import { BaseRepository } from '../base/base.repository';
import { DataSource, IsNull } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryEntity } from 'src/database/entities/category.entity';
import { ProductEntity } from 'src/database/entities/product.entity';
import { PaginateCategoriesDto } from 'src/shared/dto/category/paginate-categories.dto';
import { paginate } from 'nestjs-typeorm-paginate';
import { CategoryStatusEnum } from 'src/shared/enums/category.enum';
import { AdminPaginateCategoriesDto } from 'src/modules/admin/management/category/dto/admin-paginate-category.dto';

@Injectable()
export class CategoryRepository extends BaseRepository<CategoryEntity> {
  constructor(datasource: DataSource) {
    super(datasource, CategoryEntity);
  }

  async findByName(name: string) {
    return this.findOne({
      where: {
        name,
        status: CategoryStatusEnum.ACTIVE,
      },
    });
  }
  async findCategoriesPaginationUser(dto: PaginateCategoriesDto) {
    return this.findCategoriesPagination(dto);
  }

  async findCategoriesPaginationAdmin(dto: AdminPaginateCategoriesDto) {
    return this.findCategoriesPagination(dto);
  }

  private async findCategoriesPagination(dto: any) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;

    const qb = this.createQueryBuilder('category');
    if (dto.includeDeleted) {
      qb.withDeleted();
    }

    if (dto.status) {
      qb.andWhere('category.status = :status', { status: dto.status });
    }

    if (dto.search) {
      qb.andWhere('category.name ILIKE :search OR category.description ILIKE', {
        search: dto.search,
      });
    }
    return paginate(qb, { page, limit });
  }

  async findInactiveCategory(categoryId: string) {
    return this.findOne({
      where: { id: categoryId, status: CategoryStatusEnum.INACTIVE },
    });
  }
}
