import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { AddToPendingOrderDto } from 'src/modules/order/dto/add-to-order.dto';
import { UserRoleEnum } from 'src/shared/enums/user.enum';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { Roles } from 'src/shared/decorators/role.decorator';
import { RemoveOrderItemDto } from 'src/modules/order/dto/remove-item.dto';
import { OrderResponseDto } from 'src/shared/dto/order/order-response.dto';
import { PaginateOrdersDto } from 'src/shared/dto/order/paginate-order.dto';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { ApiPaginatedResponse } from 'src/shared/decorators/api-paginated-response.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiBaseResponse } from 'src/shared/decorators/api-base-response.decorator';
import { ResponseInterceptor } from 'src/shared/interceptors/response.interceptor';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.USER)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // =========================
  // CREATE ORDER (CHECKOUT)
  // =========================
  @Post()
  @ApiOperation({ summary: 'Create order from items' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
  })
  @ApiBaseResponse(OrderResponseDto)
  @ApiBody({ type: CreateOrderDto })
  @UseInterceptors(ClassSerializerInterceptor, ResponseInterceptor)
  async createOrder(@Req() req: any, @Body() dto: CreateOrderDto) {
    return this.orderService.createOrder(req.user.userId, dto);
  }

  // =========================
  // ADD PRODUCT TO PENDING ORDER (CART)
  // =========================
  // @Post('pending/add-item')
  // @ApiOperation({ summary: 'Add product to pending order (cart)' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Product added to pending order',
  //   type: OrderResponseDto,
  // })
  // @UseInterceptors(ClassSerializerInterceptor)
  // async addToPendingOrder(@Req() req: any, @Body() dto: AddToPendingOrderDto) {
  //   return this.orderService.addProductToPendingOrder(req.user.userId, dto);
  // }

  // =========================
  // USER: GET ALL ORDERS
  // =========================
  @Get()
  @ApiOperation({ summary: 'get all orders' })
  @ApiPaginatedResponse(OrderResponseDto)
  @UseInterceptors(ClassSerializerInterceptor, ResponseInterceptor)
  async getAllOrders(@Req() req: any, @Query() dto: PaginateOrdersDto) {
    return this.orderService.getOrdersByUserPagination(req.user.userId, dto);
  }

  // =========================
  // USER: GET ORDER BY ID
  // =========================
  @Get(':id')
  @ApiOperation({ summary: 'Get order by id (owner only)' })
  @ApiBaseResponse(OrderResponseDto)
  @ApiParam({name: 'id', type: 'string', format: 'uuid'})
  @UseInterceptors(ClassSerializerInterceptor, ResponseInterceptor)
  async getOrderById(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.getOrderById(id, req.user.userId);
  }

  // =========================
  // USER: CANCEL ORDER BY ID
  // =========================
  @Delete(':id/cancel')
  @ApiOperation({ summary: 'Cancel order by id (owner only)' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiParam({name: 'id', type: 'string', format: 'uuid'})
  async cancelOrder(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.cancelOrder(id, req.user.userId);
  }

  // =========================
  // USER: REMOVE ORDER ITEM
  // =========================
  // @Delete('pending/item')
  // @ApiOperation({ summary: 'Delete order item' })
  // @ApiResponse({ status: 200, description: 'Item deleted successfully' })
  // async removeItem(@Req() req: any, @Body() dto: RemoveOrderItemDto) {
  //   return this.orderService.removeItemFromPendingOrder(req.user.userId, dto);
  // }
}
