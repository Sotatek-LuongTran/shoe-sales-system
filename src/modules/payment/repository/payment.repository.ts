import { Injectable } from '@nestjs/common';
import { PaymentEntity } from 'src/database/entities/payment.entity';
import { BaseRepository } from 'src/shared/modules/base/base.repository';
import { DataSource } from 'typeorm';
import { PaginatePaymentsDto } from '../../../shared/dto/payment/paginate-payments.dto';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class PaymentRepository extends BaseRepository<PaymentEntity> {
  constructor(datasource: DataSource) {
    super(datasource, PaymentEntity);
  }

  async findByIdWithOrder(id: string): Promise<PaymentEntity | null> {
    return this.findOne({
      where: { id },
      relations: ['order'],
    });
  }

  async findPaymentsPagination(
    dto: PaginatePaymentsDto,
  ): Promise<Pagination<PaymentEntity>> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;

    const qb = this.createQueryBuilder('payment');
    return paginate(qb, { page, limit });
  }
}
