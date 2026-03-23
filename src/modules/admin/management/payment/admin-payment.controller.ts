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
import { AdminPaginatePaymentsDto } from './dto/admin-paginate-payments.dto';
import { AdminPaymentResponseDto } from './dto/admin-payment-response.dto';
import { ApiBaseResponse } from 'src/shared/decorators/api-base-response.decorator';

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
  @ApiPaginatedResponse(AdminPaymentResponseDto)
  @UseInterceptors(ClassSerializerInterceptor)
  async getAllPayments(@Query() dto: AdminPaginatePaymentsDto) {
    return this.adminPaymentService.getAllPayments(dto);
  }
  // =========================
  // REFUND PAYMENT
  // =========================
  @Post('refund/:paymentId')
  @ApiOperation({ summary: 'Admin refund payment' })
  @ApiBaseResponse(AdminPaymentResponseDto)
  @ApiParam({name: 'paymentId', required: true, type: 'string', format: 'uuid' })
  @UseInterceptors(ClassSerializerInterceptor)
  async refund(@Param('paymentId', ParseUUIDPipe) paymentId: string) {
    return this.adminPaymentService.refundPayment(paymentId);
  }
}
