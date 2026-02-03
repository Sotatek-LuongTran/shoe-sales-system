import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentStatus } from 'src/shared/enums/payment.enum';
import { OrderPaymentStatus, OrderStatus } from 'src/shared/enums/order.enum';
import { PaymentRepository } from './repository/payment.repository';
import { OrderRepository } from '../../shared/modules/common-order/order.repository';
import { ProductVariantRepository } from 'src/shared/modules/common-product-variant/product-variant.repository';
import { PaymentEntity } from 'src/database/entities/payment.entity';
import { OrderEntity } from 'src/database/entities/order.entity';
import { DataSource } from 'typeorm';

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

    if (order.paymentStatus === OrderPaymentStatus.PAID) {
      throw new BadRequestException('Order already paid');
    }

    const payment = await this.paymentRepository.create({
      orderId,
      amount: order.totalPrice,
      paymentStatus: PaymentStatus.PENDING,
    });

    await this.paymentRepository.save(payment);

    return {
      paymentId: payment.id,
      amount: payment.amount,
      message: 'Payment created (fake)',
    };
  }

  /**
   * Simulate payment confirmation
   */
  async confirmPayment(paymentId: string) {
    return this.dataSource.transaction(async (manager) => {
      const payment = await this.paymentRepository.findByIdWithOrder(paymentId);

      if (!payment) throw new NotFoundException('Payment not found');

      if (payment.paymentStatus !== PaymentStatus.PENDING) {
        throw new BadRequestException('Payment already processed');
      }

      const order = await this.orderRepository.findById(payment.orderId, ['items']);

      if (!order) throw new NotFoundException('Order is missing');
      // Fake payment result
      const success = Math.random() > 0.2; // 80% success

      if (success) {
        payment.paymentStatus = PaymentStatus.SUCCESSFUL;
        order.status = OrderStatus.COMPLETED;
        order.paymentStatus = OrderPaymentStatus.PAID;
      } else {
        payment.paymentStatus = PaymentStatus.FAILED;
        order.status = OrderStatus.CANCELLED;
        order.paymentStatus = OrderPaymentStatus.UNPAID;

        // 🔁 ROLLBACK STOCK
        for (const item of order.items) {
          const variant =
            await this.productVariantRepository.findByProductAndVariant(
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

      return {
        paymentStatus: payment.paymentStatus,
        orderStatus: order.status,
      };
    });
  }

  async retryPayment(paymentId: string, userId: string) {
    const payment = await this.paymentRepository.findByIdWithOrder(paymentId);

    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.order.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (payment.paymentStatus !== PaymentStatus.FAILED) {
      throw new BadRequestException('Only failed payments can be retried');
    }

    payment.paymentStatus = PaymentStatus.PENDING;
    await this.paymentRepository.save(payment);

    payment.order.status = OrderStatus.PROCESSING;
    await this.orderRepository.save(payment.order);

    return {
      message: 'Payment retry initiated',
      paymentId: payment.id,
    };
  }

  async refundPayment(paymentId: string) {
    return this.dataSource.transaction(async (manager) => {
      const payment = await manager.getRepository(PaymentEntity).findOne({
        where: { id: paymentId },
        relations: ['order', 'order.items'],
      });

      if (!payment) throw new NotFoundException('Payment not found');

      if (payment.paymentStatus !== PaymentStatus.SUCCESSFUL) {
        throw new BadRequestException('Only paid payments can be refunded');
      }

      payment.paymentStatus = PaymentStatus.REFUNDED;
      payment.order.status = OrderStatus.CANCELLED;
      payment.order.paymentStatus = OrderPaymentStatus.UNPAID;

      // RESTORE STOCK
      for (const item of payment.order.items) {
        const variant =
          await this.productVariantRepository.findByProductAndVariant(
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

  async getAllPayments() {
    return this.paymentRepository.findAll();
  }
}
