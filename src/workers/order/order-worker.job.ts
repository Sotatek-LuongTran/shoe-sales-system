import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';
import { OrderStatusEnum } from 'src/shared/enums/order.enum';
import { PaymentStatusEnum } from 'src/shared/enums/payment.enum';
import { OrderRepository } from 'src/shared/modules/common-order/order.repository';
import { PaymentRepository } from 'src/shared/modules/common-payment/payment.repository';
import { ProductVariantRepository } from 'src/shared/modules/common-product-variant/product-variant.repository';
import { DataSource } from 'typeorm';

@Injectable()
export class OrderWorkerJob {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly dataSource: DataSource,
  ) {}
  @Cron(CronExpression.EVERY_30_SECONDS)
  async cancelExpiredOrders() {
    console.log('Start cancel expired orders . . .');
    await this.dataSource.transaction(async (manager) => {
      const pendingOrders = await manager
        .withRepository(this.orderRepository)
        .findAllPendingOrders();

      for (const order of pendingOrders) {
        for (const item of order.items) {
          const variant = await manager
            .withRepository(this.productVariantRepository)
            .findByProductAndValue(item.productId, item.variantValue);

          if (!variant) {
            throw new NotFoundException({
              errorCode: ErrorCodeEnum.PRODUCT_VARIANT_NOT_FOUND,
              statusCode: 404,
              message: 'Variant not found',
            });
          }

          variant.reservedStock -= item.quantity;
          await manager
            .withRepository(this.productVariantRepository)
            .save(variant);
        }
        order.status = OrderStatusEnum.EXPIRED;
        await manager.withRepository(this.orderRepository).save(order);

        order.payment.paymentStatus = PaymentStatusEnum.CANCELLED;
        await manager
          .withRepository(this.paymentRepository)
          .save(order.payment);
        console.log(
          `- Cancelled order: ${order.id} with payment: ${order.payment.id}.`,
        );
      }
    });
    console.log('Cancel expired orders completed.');
  }
}
