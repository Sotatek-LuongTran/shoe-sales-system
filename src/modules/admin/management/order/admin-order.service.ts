import { Injectable } from '@nestjs/common';
import { OrderResponseDto } from 'src/shared/dto/order/order-response.dto';
import { PaginateOrdersDto } from 'src/shared/dto/order/paginate-order.dto';
import { OrderRepository } from 'src/shared/modules/common-order/order.repository';

@Injectable()
export class AdminOrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
  ) {}

  async getAllOrdersPagination(dto: PaginateOrdersDto) {
    const orders = await this.orderRepository.findOrdersPagination(dto);

    return {
      ...orders,
      items: orders.items.map((item) => new OrderResponseDto(item)),
    };
  }
}
