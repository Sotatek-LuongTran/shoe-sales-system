import { Injectable } from '@nestjs/common';
import { OrderEntity } from 'src/database/entities/order.entity';
import { OrderPaymentStatus, OrderStatus } from 'src/shared/enums/order.enum';
import { BaseRepository } from 'src/shared/modules/base/base.repository';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class OrderRepository extends BaseRepository<OrderEntity> {
  constructor(datasource: DataSource) {
    super(datasource, OrderEntity);
  }

  createOrder(manager: EntityManager, userId: string) {
    return manager.getRepository(OrderEntity).save({
      userId,
      status: OrderStatus.PROCESSING,
      paymentStatus: OrderPaymentStatus.UNPAID,
    });
  }

  async findOrdersByUser(userId: string) {
    return this.repository.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(orderId: string, relations: string[] = []) {
    const order = await this.repository.findOne({
      where: { id: orderId },
      relations: [...relations],
    });
    return order;
  }

  async findAllOrders() {
    return this.repository.find({
      relations: ['items', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPendingOrderByUser(userId: string) {
    return this.repository.findOne({
      where: {
        userId,
        status: OrderStatus.PENDING,
        deletedAt: undefined,
      },
      relations: ['items'],
    });
  }
}
