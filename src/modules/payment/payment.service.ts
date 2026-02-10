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
import { PaginatePaymentsDto } from 'src/shared/dto/payment/paginate-payments.dto';
import { UserRepository } from 'src/shared/modules/user/user.repository';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly orderRepository: OrderRepository,
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly userRepository: UserRepository,
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

      const order = await this.orderRepository.findOrderWithItems(payment.orderId);

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

    return new PaymentResponseDto(payment)
  }

  async getMyPaymentsPagination(userId: string, dto: PaginatePaymentsDto) {
    if (!dto.userId || dto.userId !== userId) {
      throw new NotFoundException()
    }
    const user = this.userRepository.findById(dto.userId)
    if (!user) {
      throw new NotFoundException()
    }

    const payments = await this.paymentRepository.findPaymentsPagination(dto)

    return {
      ...payments,
      items: payments.items.map(
        item => new PaymentResponseDto(item)
      )
    }
  }
}
