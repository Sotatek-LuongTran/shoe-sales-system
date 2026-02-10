import { Injectable } from '@nestjs/common';
import { OrderResponseDto } from 'src/shared/dto/order/order-response.dto';
import { PaginateOrdersDto } from 'src/shared/dto/order/paginate-order.dto';
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
