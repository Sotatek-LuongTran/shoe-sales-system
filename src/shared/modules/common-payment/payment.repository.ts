import { Injectable } from '@nestjs/common';
import { PaymentEntity } from 'src/database/entities/payment.entity';
import { BaseRepository } from 'src/shared/modules/base/base.repository';
import { DataSource } from 'typeorm';
import { PaginatePaymentsDto } from '../../dto/payment/paginate-payments.dto';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { AdminPaginatePaymentsDto } from 'src/modules/admin/management/payment/dto/admin-paginate-payments.dto';

@Injectable()
export class PaymentRepository extends BaseRepository<PaymentEntity> {
  constructor(datasource: DataSource) {
    super(datasource, PaymentEntity);
  }

  async findByIdWithOrder(id: string): Promise<PaymentEntity | null> {
    return this.findOne({
      where: { id },
      relations: {
        order: {
          items: true,
        },
      },
    });
  }

  async findPaymentsPaginationUser(userId: string, dto: PaginatePaymentsDto) {
    return this.findPaymentsPagination(userId, dto);
  }
  async findPaymentsPaginationAdmin(
    userId: string,
    dto: AdminPaginatePaymentsDto,
  ) {
    return this.findPaymentsPagination(userId, dto);
  }

  private async findPaymentsPagination(
    userId: string,
    dto: any,
  ): Promise<Pagination<PaymentEntity>> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;

    const qb = this.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'order')
      .leftJoinAndSelect('order.items','items');

    if (userId) {
      qb.leftJoin('order.user', 'user').where('user.id = :userId', {
        userId: userId,
      });
    }
    return paginate(qb, { page, limit });
  }
}
