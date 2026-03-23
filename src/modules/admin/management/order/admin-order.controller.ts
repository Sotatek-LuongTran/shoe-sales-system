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
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { ApiPaginatedResponse } from 'src/shared/decorators/api-paginated-response.decorator';
import { AdminPaginateOrdersDto } from './dto/admin-paginate-orders.dto';
import { AdminOrderResponseDto } from './dto/admin-order-reponse.dto';

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
  @ApiPaginatedResponse(AdminOrderResponseDto)
  @UseInterceptors(ClassSerializerInterceptor)
  async getAllOrders(@Query() dto: AdminPaginateOrdersDto) {
    return this.adminOrderService.getAllOrdersPagination(dto);
  }
}
