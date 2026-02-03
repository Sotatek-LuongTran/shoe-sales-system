import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { CreateOrderDto } from 'src/shared/dto/order/create-order.dto';
import { AddToPendingOrderDto } from 'src/shared/dto/order/add-to-order.dto';
import { UserRole } from 'src/shared/enums/user.enum';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { Roles } from 'src/shared/decorators/role.decorator';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // =========================
  // CREATE ORDER (CHECKOUT)
  // =========================
  @Post()
  @ApiOperation({ summary: 'Create order from items' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkoutOrder(@Req() req: any) {
    return this.orderService.checkoutOrder( req.user.id);
  }

  // =========================
  // ADD PRODUCT TO PENDING ORDER (CART)
  // =========================
  @Post('pending/add-item')
  @ApiOperation({ summary: 'Add product to pending order (cart)' })
  @ApiResponse({ status: 200, description: 'Product added to pending order' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addToPendingOrder(@Req() req: any, @Body() dto: AddToPendingOrderDto) {
    return this.orderService.addProductToPendingOrder(req.user.id, dto);
  }

  // =========================
  // USER: GET MY ORDERS
  // =========================
  @Get('me')
  @ApiOperation({ summary: 'Get my orders' })
  @ApiResponse({ status: 200, description: 'Oder get successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyOrders(@Req() req: any) {
    return this.orderService.getMyOrders(req.user.id);
  }

  // =========================
  // USER: GET ORDER BY ID
  // =========================
  @Get(':id')
  @ApiOperation({ summary: 'Get order by id (owner only)' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getOrderById(@Req() req: any, @Param('id') id: string) {
    return this.orderService.getOrderById(id, req.user.id);
  }

  // =========================
  // ADMIN: GET ALL ORDERS
  // =========================
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: get all orders' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllOrders() {
    return this.orderService.getAllOrders();
  }

  // =========================
  // USER: CANCEL ORDER BY ID
  // =========================
  @Delete(':id/cancel')
  @ApiOperation({ summary: 'Cancel order by id (owner only)' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async cancelOrder(@Req() req: any, @Param('id') id: string) {
    return this.orderService.cancelOrder(id, req.user.id);
  }
}
