import { Injectable } from '@nestjs/common';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { OrderEntity } from 'src/database/entities/order.entity';
import { PaginateOrdersDto } from 'src/shared/dto/order/paginate-order.dto';
import {
  OrderPaymentStatusEnum,
  OrderStatusEnum,
} from 'src/shared/enums/order.enum';
import { BaseRepository } from 'src/shared/modules/base/base.repository';
import { DataSource, EntityManager, IsNull } from 'typeorm';

@Injectable()
export class OrderRepository extends BaseRepository<OrderEntity> {
  constructor(datasource: DataSource) {
    super(datasource, OrderEntity);
  }

  createOrder(manager: EntityManager, userId: string) {
    return manager.getRepository(OrderEntity).save({
      userId,
      status: OrderStatusEnum.PROCESSING,
      paymentStatus: OrderPaymentStatusEnum.UNPAID,
    });
  }

  async findOrdersByUser(userId: string) {
    return this.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(orderId: string, relations: string[] = []) {
    const order = await this.findOne({
      where: { id: orderId },
      relations: [...relations],
    });
    return order;
  }

  async findOrdersPagination(dto: PaginateOrdersDto): Promise<Pagination<OrderEntity>> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;

    const qb = this.createQueryBuilder('order').leftJoin(
      'order.orderItems',
      'item',
    );
    return paginate(qb, { page, limit });
  }

  async findPendingOrderByUser(userId: string) {
    return this.findOne({
      where: {
        user: { id: userId },
        status: OrderStatusEnum.PENDING,
        deletedAt: IsNull(),
      },
      relations: {
        items: true,
        user: true,
      },
    });
  }
}
