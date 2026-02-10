import { Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginatePaymentsDto } from 'src/modules/admin/management/payment/dto/paginate-payments.dto';
import { Roles } from 'src/shared/decorators/role.decorator';
import { UserRoleEnum } from 'src/shared/enums/user.enum';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { AdminPaymentService } from './admin-payment.service';

@Controller('admin/payments')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRoleEnum.ADMIN)
@UseGuards(RolesGuard)
@ApiTags('Admin')
export class AdminPaymentController {
  constructor(private readonly adminPaymentService: AdminPaymentService) {}
  // =========================
  // ADMIN: GET ALL PAYMENTS
  // =========================
  @Get()
  @ApiOperation({ summary: 'Admin: get all payments' })
  @ApiQuery({ name: 'dto', required: true, type: PaginatePaymentsDto })
  async getAllPayments(@Query('dto') dto: PaginatePaymentsDto) {
    return this.adminPaymentService.getAllPayments(dto);
  }
  // =========================
  // REFUND PAYMENT
  // =========================
  @Post('refund/:paymentId')
  @ApiOperation({ summary: 'Admin refund payment' })
  @ApiResponse({ status: 200, description: 'Payment refunded successfully' })
  async refund(@Param('paymentId', ParseUUIDPipe) paymentId: string) {
    return this.adminPaymentService.refundPayment(paymentId);
  }
}
