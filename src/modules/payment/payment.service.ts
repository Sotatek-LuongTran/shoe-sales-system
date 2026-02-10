import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentStatusEnum } from 'src/shared/enums/payment.enum';
import { OrderPaymentStatusEnum, OrderStatusEnum } from 'src/shared/enums/order.enum';
import { PaymentRepository } from './repository/payment.repository';
import { OrderRepository } from '../../shared/modules/common-order/order.repository';
import { ProductVariantRepository } from 'src/shared/modules/common-product-variant/product-variant.repository';
import { PaymentEntity } from 'src/database/entities/payment.entity';
import { OrderEntity } from 'src/database/entities/order.entity';
import { DataSource } from 'typeorm';
import { PaymentResponseDto } from 'src/shared/dto/payment/payment-response.dto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly orderRepository: OrderRepository,
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * USER starts payment (fake)
   */
  async createPayment(orderId: string, userId: string) {
    const order = await this.orderRepository.findById(orderId);

    if (!order) throw new NotFoundException('Order not found');

    if (order.userId !== userId) {
      throw new BadRequestException('You cannot pay for this order');
    }

    if (order.paymentStatus === OrderPaymentStatusEnum.PAID) {
      throw new BadRequestException('Order already paid');
    }

    const payment = this.paymentRepository.create({
      orderId,
      amount: order.totalPrice,
      paymentStatus: PaymentStatusEnum.PENDING,
    });

    await this.paymentRepository.save(payment);

    return new PaymentResponseDto(payment)
  }

  /**
   * Simulate payment confirmation
   */
  async confirmPayment(paymentId: string) {
    return this.dataSource.transaction(async (manager) => {
      const payment = await this.paymentRepository.findByIdWithOrder(paymentId);

      if (!payment) throw new NotFoundException('Payment not found');

      if (payment.paymentStatus !== PaymentStatusEnum.PENDING) {
        throw new BadRequestException('Payment already processed');
      }

      const order = await this.orderRepository.findById(payment.orderId, ['items']);

      if (!order) throw new NotFoundException('Order is missing');
      // Fake payment result
      const success = Math.random() > 0.2; // 80% success

      if (success) {
        payment.paymentStatus = PaymentStatusEnum.SUCCESSFUL;
        order.status = OrderStatusEnum.COMPLETED;
        order.paymentStatus = OrderPaymentStatusEnum.PAID;
      } else {
        payment.paymentStatus = PaymentStatusEnum.FAILED;
        order.status = OrderStatusEnum.CANCELLED;
        order.paymentStatus = OrderPaymentStatusEnum.UNPAID;

        // ROLLBACK STOCK
        for (const item of order.items) {
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
      }

      await this.paymentRepository.save(payment);
      await this.orderRepository.save(order);

      return new PaymentResponseDto(payment)
    });
  }

  async retryPayment(paymentId: string, userId: string) {
    const payment = await this.paymentRepository.findByIdWithOrder(paymentId);

    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.order.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (payment.paymentStatus !== PaymentStatusEnum.FAILED) {
      throw new BadRequestException('Only failed payments can be retried');
    }

    payment.paymentStatus = PaymentStatusEnum.PENDING;
    await this.paymentRepository.save(payment);

    payment.order.status = OrderStatusEnum.PROCESSING;
    await this.orderRepository.save(payment.order);

    return {
      message: 'Payment retry initiated',
      paymentId: payment.id,
    };
  }
}
