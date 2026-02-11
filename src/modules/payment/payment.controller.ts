import {
  Controller,
  Post,
  Param,
  Req,
  UseGuards,
  Get,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PaymentService } from './payment.service';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { UserRoleEnum } from 'src/shared/enums/user.enum';
import { Roles } from 'src/shared/decorators/role.decorator';
import { PaymentResponseDto } from 'src/shared/dto/payment/payment-response.dto';
import { PaginatePaymentsDto } from 'src/shared/dto/payment/paginate-payments.dto';
import { PaginationPaymentResponseDto } from 'src/shared/dto/payment/pagination-order-response';

@ApiTags('Payments')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRoleEnum.USER)
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // =========================
  // CREATE PAYMENT (USER)
  // =========================
  @Post(':orderId')
  @ApiOperation({ summary: 'Create payment for an order (fake)' })
  @ApiParam({ name: 'orderId', type: String })
  @ApiResponse({
    status: 201,
    description: 'Payment created',
    type: PaymentResponseDto,
  })
  async createPayment(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Req() req: any,
  ) {
    return this.paymentService.createPayment(orderId, req.user.userId);
  }

  // =========================
  // CONFIRM PAYMENT (FAKE)
  // =========================
  @Post('confirm/:paymentId')
  @ApiOperation({ summary: 'Confirm payment (simulate success/failure)' })
  @ApiParam({ name: 'paymentId', type: String })
  @ApiResponse({
    status: 200,
    description: 'Payment processed',
    type: PaymentResponseDto,
  })
  async confirmPayment(@Param('paymentId', ParseUUIDPipe) paymentId: string) {
    return this.paymentService.confirmPayment(paymentId);
  }

  // =========================
  // RETRY PAYMENT (FAKE)
  // =========================
  @Post('retry/:paymentId')
  @ApiOperation({ summary: 'Retry failed payment' })
  @ApiResponse({
    status: 200,
    description: 'Payment retried successfully',
    type: PaymentResponseDto,
  })
  @ApiParam({name: 'paymentId', type: 'string', format: 'uuid'})
  async retryPayment(
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
    @Req() req: any,
  ) {
    return this.paymentService.retryPayment(paymentId, req.user.userId);
  }

  // =========================
  // USER: GET ALL PAYMENTS
  // =========================
  @Get()
  @ApiOperation({ summary: 'get all payments' })
  @ApiResponse({
    status: 200,
    description: 'Payment get successfully',
    type: PaginationPaymentResponseDto,
  })
  @ApiQuery({ name: 'dto', required: true, type: PaginatePaymentsDto })
  async getAllOrders(@Req() req: any, @Query('dto') dto: PaginatePaymentsDto) {
    return this.paymentService.getMyPaymentsPagination(req.user.userId, dto);
  }

}
