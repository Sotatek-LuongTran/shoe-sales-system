import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderEntity } from 'src/database/entities/order.entity';
import { PaymentEntity } from 'src/database/entities/payment.entity';
import { PaginatePaymentsDto } from 'src/shared/dto/payment/paginate-payments.dto';
import { PaymentRepository } from 'src/modules/payment/repository/payment.repository';
import { OrderPaymentStatusEnum, OrderStatusEnum } from 'src/shared/enums/order.enum';
import { PaymentStatusEnum } from 'src/shared/enums/payment.enum';
import { ProductVariantRepository } from 'src/shared/modules/common-product-variant/product-variant.repository';
import { DataSource } from 'typeorm';

@Injectable()
export class AdminPaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly dataSource: DataSource,
    private readonly productVariantRepository: ProductVariantRepository,
  ) {}

  async getAllPayments(dto: PaginatePaymentsDto) {
    return this.paymentRepository.findPaymentsPagination(dto);
  }

  async refundPayment(paymentId: string) {
    return this.dataSource.transaction(async (manager) => {
      const payment = await manager.getRepository(PaymentEntity).findOne({
        where: { id: paymentId },
        relations: ['order', 'order.items'],
      });

      if (!payment) throw new NotFoundException('Payment not found');

      if (payment.paymentStatus !== PaymentStatusEnum.SUCCESSFUL) {
        throw new BadRequestException('Only paid payments can be refunded');
      }

      payment.paymentStatus = PaymentStatusEnum.REFUNDED;
      payment.order.status = OrderStatusEnum.CANCELLED;
      payment.order.paymentStatus = OrderPaymentStatusEnum.UNPAID;

      // RESTORE STOCK
      for (const item of payment.order.items) {
        const variant =
          await this.productVariantRepository.findByProductAndValue(
            item.productId,
            item.variantValue,
          );

        if (variant) {
          variant.stock += item.quantity;
          await manager.getRepository(variant.constructor).save(variant);
        }
      }

      await manager.getRepository(PaymentEntity).save(payment);
      await manager.getRepository(OrderEntity).save(payment.order);

      return { message: 'Refund successful' };
    });
  }
}
