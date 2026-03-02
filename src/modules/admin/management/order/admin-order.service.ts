import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderResponseDto } from 'src/shared/dto/order/order-response.dto';
import { PaginateOrdersDto } from 'src/shared/dto/order/paginate-order.dto';
import { OrderRepository } from 'src/shared/modules/common-order/order.repository';
import { AdminPaginateOrdersDto } from './dto/admin-paginate-orders.dto';
import { UserRepository } from 'src/shared/modules/common-user/user.repository';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';
import { AdminOrderResponseDto } from './dto/admin-order-reponse.dto';

@Injectable()
export class AdminOrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async getAllOrdersPagination(dto: AdminPaginateOrdersDto) {
    const user = this.userRepository.findById(dto.userId);
    if (!user) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.USER_NOT_FOUND,
        status: 404,
        message: 'User not found',
      });
    }
    const orders = await this.orderRepository.findOrdersPaginationAdmin(dto.userId, dto);

    return {
      ...orders,
      items: orders.items.map((item) => new AdminOrderResponseDto(item)),
    };
  }
}
