import { Injectable } from '@nestjs/common';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { OrderEntity } from 'src/database/entities/order.entity';
import { AdminPaginateOrdersDto } from 'src/modules/admin/management/order/dto/admin-paginate-orders.dto';
import { PaginateOrdersDto } from 'src/shared/dto/order/paginate-order.dto';
import {
  OrderPaymentStatusEnum,
  OrderStatusEnum,
} from 'src/shared/enums/order.enum';
import { BaseRepository } from 'src/shared/modules/base/base.repository';
import { DataSource, EntityManager, IsNull, LessThan } from 'typeorm';

@Injectable()
export class OrderRepository extends BaseRepository<OrderEntity> {
  constructor(datasource: DataSource) {
    super(datasource, OrderEntity);
  }

  // async findOrdersByUser(userId: string) {
  //   return this.find({
  //     where: { userId },
  //     relations: ['items'],
  //     order: { createdAt: 'DESC' },
  //   });
  // }

  // async findOrdersByUserPagination(
  //   userId: string,
  //   dto: PaginateOrdersDto,
  // ): Promise<Pagination<OrderEntity>> {
  //   const page = dto.page ?? 1;
  //   const limit = dto.limit ?? 10;

  //   const qb = this.createQueryBuilder('order')
  //     .leftJoin('order.orderItems', 'item')
  //     .leftJoin('order.user', 'user')
  //     .where('user.id ILIKE :userId', {userId: `%${userId}%`});
  //   return paginate(qb, { page, limit });
  // }

  async findOrdersPaginationUser(userId: string, dto: PaginateOrdersDto) {
    return this.findOrdersPagination(userId, dto);
  }

  async findOrdersPaginationAdmin(userId: string, dto: AdminPaginateOrdersDto) {
    return this.findOrdersPagination(userId, dto);
  }

  private async findOrdersPagination(
    userId: string,
    dto: any,
  ): Promise<Pagination<OrderEntity>> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;

    const qb = this.createQueryBuilder('order').leftJoin(
      'order.items',
      'items',
    );
    if (userId) {
      qb.leftJoin('order.user', 'user').where('user.id = :userId', {
        userId: userId,
      });
    }

    if (dto.search) {
      qb.where('order.');
    }

    if (dto.search) {
      qb.where('order.');
    }
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
        payment: true,
      },
    });
  }

  async findOrderWithItems(id: string) {
    return this.findOne({
      where: {
        id,
        status: OrderStatusEnum.PROCESSING,
      },
      relations: {
        items: true,
        payment: true,
      },
    });
  }

  async findAllPendingOrders() {
    return this.find({
      where: {
        status: OrderStatusEnum.PENDING,
        expiresAt: LessThan(new Date())
      },
      relations: {
        items: true,
        payment: true,
      }
    })
  }
}
