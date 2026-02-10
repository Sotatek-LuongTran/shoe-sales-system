import { Injectable } from '@nestjs/common';
import { PaginateOrdersDto } from 'src/modules/order/dto/paginate-order.dto';
import { OrderRepository } from 'src/shared/modules/common-order/order.repository';

@Injectable()
export class AdminOrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
  ) {}

  async getAllOrders(dto: PaginateOrdersDto) {
    return this.orderRepository.findOrdersPagination(dto);
  }
}
