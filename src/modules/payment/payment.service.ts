import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentStatusEnum } from 'src/shared/enums/payment.enum';
import {
  OrderPaymentStatusEnum,
  OrderStatusEnum,
} from 'src/shared/enums/order.enum';
import { PaymentRepository } from '../../shared/modules/common-payment/payment.repository';
import { OrderRepository } from '../../shared/modules/common-order/order.repository';
import { ProductVariantRepository } from 'src/shared/modules/common-product-variant/product-variant.repository';
import { DataSource, LessThan, MoreThan } from 'typeorm';
import { PaymentResponseDto } from 'src/shared/dto/payment/payment-response.dto';
import { PaginatePaymentsDto } from 'src/shared/dto/payment/paginate-payments.dto';
import { UserRepository } from 'src/shared/modules/common-user/user.repository';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';
import { PaymentEntity } from 'src/database/entities/payment.entity';
import { OrderEntity } from 'src/database/entities/order.entity';
import { ProductVariantEntity } from 'src/database/entities/product-variant.entity';
import { VariantStatusEnum } from 'src/shared/enums/product-variant.enum';
import { RedisService } from 'src/shared/modules/redis/redis.service';
import { PaymentEventEnum } from 'src/shared/enums/events.enum';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly orderRepository: OrderRepository,
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  /**
   * USER starts payment (fake)
   */
  async createPayment(orderId: string, userId: string) {
    const order = await this.orderRepository.findById(orderId);

    if (!order)
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.ORDER_NOT_FOUND,
        statusCode: 404,
        message: 'Order not found',
      });

    if (order.userId !== userId) {
      throw new ForbiddenException({
        errorCode: ErrorCodeEnum.ORDER_ACCESS_DENIED,
        statusCode: 403,
        message: 'Access denied',
      });
    }

    if (order.paymentStatus === OrderPaymentStatusEnum.PAID) {
      throw new BadRequestException({
        errorCode: ErrorCodeEnum.ORDER_ALREADY_PAID,
        statusCode: 400,
        message: 'Order has already been paid',
      });
    }

    const payment = this.paymentRepository.create({
      orderId,
      amount: order.totalPrice,
      paymentStatus: PaymentStatusEnum.PENDING,
    });

    await this.paymentRepository.save(payment);

    return new PaymentResponseDto(payment);
  }

  /**
   * Simulate payment confirmation
   */
  async confirmPayment(paymentId: string) {
    return this.dataSource.transaction(async (manager) => {
      const payment = await manager.getRepository(PaymentEntity).findOne({
        where: {
          id: paymentId,
        },
        relations: ['order'],
      });

      if (!payment)
        throw new NotFoundException({
          errorCode: ErrorCodeEnum.PAYMENT_NOT_FOUND,
          statusCode: 404,
          message: 'Payment not found',
        });

      if (payment.paymentStatus !== PaymentStatusEnum.PENDING) {
        throw new BadRequestException({
          errorCode: ErrorCodeEnum.PAYMENT_ALREADY_PROCESSED,
          statusCode: 400,
          message: 'Paymen has already processed',
        });
      }

      const order = await manager.getRepository(OrderEntity).findOne({
        where: {
          status: OrderStatusEnum.PENDING,
          expiresAt: MoreThan(new Date()),
        },
        relations: {
          items: true,
        },
      });

      if (!order)
        throw new NotFoundException({
          errorCode: ErrorCodeEnum.ORDER_NOT_FOUND,
          statusCode: 404,
          message: 'Order not found',
        });
      // Fake payment result
      const success = Math.random() > 0.2; // 80% success

      if (success) {
        payment.paymentStatus = PaymentStatusEnum.SUCCESSFUL;
        order.status = OrderStatusEnum.COMPLETED;
        order.paymentStatus = OrderPaymentStatusEnum.PAID;

        for (const item of order.items) {
          const variant = await manager
            .getRepository(ProductVariantEntity)
            .createQueryBuilder('variant')
            .setLock('pessimistic_write')
            .where('variant.product_id = :productId', {
              productId: item.productId,
            })
            .andWhere('variant.variant_value = :variantValue', {
              variantValue: item.variantValue,
            })
            .andWhere('variant.status = :status', {
              status: VariantStatusEnum.ACTIVE,
            })
            .getOne();

          if (variant) {
            variant.reservedStock -= item.quantity;
            variant.stock -= item.quantity;
            await manager.getRepository(ProductVariantEntity).save(variant);
          }
        }
        await this.redisService.publish(PaymentEventEnum.PAYMENT_SUCCESS, {
          userId: order.userId,
          orderId: order.id,
          paymentId: payment.id,
        })
      } else {
        payment.paymentStatus = PaymentStatusEnum.FAILED;
        order.status = OrderStatusEnum.CANCELLED;
        order.paymentStatus = OrderPaymentStatusEnum.UNPAID;

        // ROLLBACK STOCK
        for (const item of order.items) {
          const variant = await manager
            .getRepository(ProductVariantEntity)
            .createQueryBuilder('variant')
            .setLock('pessimistic_write')
            .where('variant.product_id = :productId', {
              productId: item.productId,
            })
            .andWhere('variant.variant_value = :variantValue', {
              variantValue: item.variantValue,
            })
            .andWhere('variant.status = :status', {
              status: VariantStatusEnum.ACTIVE,
            })
            .getOne();

          if (variant) {
            variant.reservedStock -= item.quantity;
            await manager.getRepository(ProductVariantEntity).save(variant);
          }
        }
      }

      await manager.getRepository(PaymentEntity).save(payment);
      await manager.getRepository(OrderEntity).save(order);

      return new PaymentResponseDto(payment);
    });
  }

  async retryPayment(paymentId: string, userId: string) {
    const payment = await this.paymentRepository.findByIdWithOrder(paymentId);

    if (!payment)
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.PAYMENT_NOT_FOUND,
        statusCode: 404,
        message: 'Payment not found',
      });

    if (payment.order.userId !== userId) {
      throw new ForbiddenException({
        errorCode: ErrorCodeEnum.ORDER_ACCESS_DENIED,
        statusCode: 403,
        message: 'Access denied',
      });
    }

    if (payment.paymentStatus !== PaymentStatusEnum.FAILED) {
      throw new BadRequestException({
        errorCode: ErrorCodeEnum.PAYMENT_INVALID_STATUS,
        statusCode: 404,
        message: 'Invalid payment status',
      });
    }

    payment.paymentStatus = PaymentStatusEnum.PENDING;
    await this.paymentRepository.save(payment);

    payment.order.status = OrderStatusEnum.PENDING;
    await this.orderRepository.save(payment.order);

    return new PaymentResponseDto(payment);
  }

  async getMyPaymentsPagination(userId: string, dto: PaginatePaymentsDto) {
    const user = this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException();
    }

    const payments = await this.paymentRepository.findPaymentsPaginationUser(
      userId,
      dto,
    );

    return {
      ...payments,
      items: payments.items.map((item) => new PaymentResponseDto(item)),
    };
  }
}
