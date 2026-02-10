import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { AddToPendingOrderDto } from 'src/modules/order/dto/add-to-order.dto';
import { UserRoleEnum } from 'src/shared/enums/user.enum';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { Roles } from 'src/shared/decorators/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RemoveOrderItemDto } from 'src/modules/order/dto/remove-item.dto';
import { OrderResponseDto } from 'src/shared/dto/order/order-response.dto';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
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
    type: OrderResponseDto,
  })
  async checkoutOrder(@Req() req: any) {
    return this.orderService.checkoutOrder(req.user.userId);
  }

  // =========================
  // ADD PRODUCT TO PENDING ORDER (CART)
  // =========================
  @Post('pending/add-item')
  @ApiOperation({ summary: 'Add product to pending order (cart)' })
  @ApiResponse({
    status: 200,
    description: 'Product added to pending order',
    type: OrderResponseDto,
  })
  async addToPendingOrder(@Req() req: any, @Body() dto: AddToPendingOrderDto) {
    return this.orderService.addProductToPendingOrder(req.user.userId, dto);
  }

  // =========================
  // USER: GET MY ORDERS
  // =========================
  @Get('me')
  @ApiOperation({ summary: 'Get my orders' })
  @ApiResponse({ status: 200, description: 'Order get successfully', type: OrderResponseDto, })
  async getMyOrders(@Req() req: any) {
    return this.orderService.getMyOrders(req.user.userId);
  }

  // =========================
  // USER: GET ORDER BY ID
  // =========================
  @Get(':id')
  @ApiOperation({ summary: 'Get order by id (owner only)' })
  @ApiResponse({ status: 200, description: 'Order get successfully', type: OrderResponseDto, })
  async getOrderById(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.getOrderById(id, req.user.userId);
  }

  // =========================
  // USER: CANCEL ORDER BY ID
  // =========================
  @Delete(':id/cancel')
  @ApiOperation({ summary: 'Cancel order by id (owner only)' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully'})
  async cancelOrder(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.cancelOrder(id, req.user.userId);
  }

  // =========================
  // USER: REMOVE ORDER ITEM
  // =========================
  @Delete('pending/item')
  @ApiOperation({ summary: 'Delete order item' })
  @ApiResponse({ status: 200, description: 'Item deleted successfully' })
  async removeItem(@Req() req: any, @Body() dto: RemoveOrderItemDto) {
    return this.orderService.removeItemFromPendingOrder(req.user.userId, dto);
  }
}
