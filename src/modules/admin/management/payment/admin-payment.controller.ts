import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginatePaymentsDto } from 'src/shared/dto/payment/paginate-payments.dto';
import { Roles } from 'src/shared/decorators/role.decorator';
import { UserRoleEnum } from 'src/shared/enums/user.enum';
import { RolesGuard } from 'src/shared/guards/role.guard';
import { AdminPaymentService } from './admin-payment.service';
import { PaymentResponseDto } from 'src/shared/dto/payment/payment-response.dto';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { ApiPaginatedResponse } from 'src/shared/decorators/api-paginated-response.decorator';

@Controller('admin/payments')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.ADMIN)
@ApiTags('Admin')
export class AdminPaymentController {
  constructor(private readonly adminPaymentService: AdminPaymentService) {}
  // =========================
  // ADMIN: GET ALL PAYMENTS
  // =========================
  @Get()
  @ApiOperation({ summary: 'Admin: get all payments' })
  @ApiResponse({
    status: 200,
    description: 'Payment refunded successfully'
  })
  @ApiPaginatedResponse(PaymentResponseDto)
  @UseInterceptors(ClassSerializerInterceptor)
  async getAllPayments(@Query() dto: PaginatePaymentsDto) {
    return this.adminPaymentService.getAllPayments(dto);
  }
  // =========================
  // REFUND PAYMENT
  // =========================
  @Post('refund/:paymentId')
  @ApiOperation({ summary: 'Admin refund payment' })
  @ApiResponse({
    status: 200,
    description: 'Payment refunded successfully',
    type: PaymentResponseDto,
  })
  @ApiParam({name: 'paymentId', required: true, type: 'string', format: 'uuid' })
  @UseInterceptors(ClassSerializerInterceptor)
  async refund(@Param('paymentId', ParseUUIDPipe) paymentId: string) {
    return this.adminPaymentService.refundPayment(paymentId);
  }
}
