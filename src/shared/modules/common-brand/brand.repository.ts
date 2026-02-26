import { BrandEntity } from 'src/database/entities/brand.entity';
import { BaseRepository } from '../base/base.repository';
import { DataSource, IsNull } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ProductEntity } from 'src/database/entities/product.entity';
import { PaginateBrandsDto } from 'src/shared/dto/brand/paginate-brands.dto';
import { paginate } from 'nestjs-typeorm-paginate';
import { BrandStatusEnum } from 'src/shared/enums/brand.enum';

@Injectable()
export class BrandRepository extends BaseRepository<BrandEntity> {
  constructor(datasource: DataSource) {
    super(datasource, BrandEntity);
  }

  async findByName(name: string) {
    return this.findOne({
      where: {
        name,
        status: BrandStatusEnum.ACTIVE,
      },
    });
  }

  async findBrandsPagination(dto: PaginateBrandsDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;

    const qb = this.createQueryBuilder('brand');
    if (dto.includeDeleted) {
      qb.withDeleted();
    }
    if (dto.status) {
      qb.andWhere('brand.status = :status', { status: dto.status });
    }

    if (dto.search) {
      qb.andWhere('brand.name ILIKE :search OR brand.description ILIKE', {
        search: `%${dto.search}%`,
      });
    }
    return paginate(qb, { page, limit });
  }

  async findInactiveBrand(brandId: string) {
    return this.findOne({
      where: { id: brandId, status: BrandStatusEnum.INACTIVE },
    });
  }
}
