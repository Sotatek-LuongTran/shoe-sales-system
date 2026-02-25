import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../../database/entities/user.entity';
import { BaseRepository } from '../base/base.repository';
import { DataSource } from 'typeorm';
import { PaginateUsersDto } from 'src/shared/dto/user/paginate-user.dto';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  constructor(dataSource: DataSource) {
    super(dataSource, UserEntity);
  }

  async findUsersPagination(
    dto: PaginateUsersDto,
  ): Promise<Pagination<UserEntity>> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;

    const qb = this.createQueryBuilder('user');

    if (dto.includeDeleted) {
      qb.withDeleted();
    }

    qb.orderBy('product.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return paginate(qb, { page, limit });
  }

  async findByEmail(email: string) {
    return this.findOne({
      where: {
        email,
      },
    });
  }
}
