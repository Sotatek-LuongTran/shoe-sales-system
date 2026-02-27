import { ClassSerializerInterceptor, Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/shared/decorators/role.decorator';
import { UserRoleEnum } from 'src/shared/enums/user.enum';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { AdminOrderService } from './admin-order.service';
import { PaginateOrdersDto } from 'src/shared/dto/order/paginate-order.dto';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { ApiPaginatedResponse } from 'src/shared/decorators/api-paginated-response.decorator';
import { OrderResponseDto } from 'src/shared/dto/order/order-response.dto';
import { AdminPaginateOrdersDto } from './dto/admin-paginate-orders.dto';

@Controller('admin/orders')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.ADMIN)
@ApiTags('Admin')
export class AdminOrderController {
  constructor(private readonly adminOrderService: AdminOrderService) {}
  // =========================
  // ADMIN: GET ALL ORDERS
  // =========================
  @Get()
  @ApiOperation({ summary: 'Admin: get all orders' })
  @ApiResponse({
    status: 201,
    description: 'Category deleted successfully',
  })
  @ApiPaginatedResponse(OrderResponseDto)
  @UseInterceptors(ClassSerializerInterceptor)
  async getAllOrders(@Query() dto: AdminPaginateOrdersDto) {
    return this.adminOrderService.getAllOrdersPagination(dto);
  }
}
