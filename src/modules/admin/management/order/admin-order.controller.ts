import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/shared/decorators/role.decorator';
import { UserRoleEnum } from 'src/shared/enums/user.enum';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { AdminOrderService } from './admin-order.service';
import { PaginateOrdersDto } from 'src/shared/dto/order/paginate-order.dto';

@Controller('admin/orders')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRoleEnum.ADMIN)
@UseGuards(RolesGuard)
@ApiTags('Admin')
export class AdminOrderController {
  constructor(private readonly adminOrderService: AdminOrderService) {}
  // =========================
  // ADMIN: GET ALL ORDERS
  // =========================
  @Get()
  @ApiOperation({ summary: 'Admin: get all orders' })
  @ApiQuery({ name: 'dto', required: true, type: PaginateOrdersDto })
  async getAllOrders(@Query('dto') dto: PaginateOrdersDto) {
    return this.adminOrderService.getAllOrders(dto);
  }
}
