import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RedisService } from 'src/shared/modules/redis/redis.service';
import { OrderEntity } from 'src/database/entities/order.entity';
import { PaymentEntity } from 'src/database/entities/payment.entity';
import { ProductVariantEntity } from 'src/database/entities/product-variant.entity';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';
import { OrderEventEnum } from 'src/shared/enums/events.enum';
import { OrderStatusEnum } from 'src/shared/enums/order.enum';
import { PaymentStatusEnum } from 'src/shared/enums/payment.enum';
import { VariantStatusEnum } from 'src/shared/enums/product-variant.enum';
import { DataSource, LessThan } from 'typeorm';

@Injectable()
export class OrderWorkerJob {
  constructor(
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}
  @Cron(CronExpression.EVERY_30_SECONDS)
  async cancelExpiredOrders() {
    console.log('Start cancel expired orders . . .');
    await this.dataSource.transaction(async (manager) => {
      const pendingOrders = await manager.getRepository(OrderEntity).find({
        where: {
          status: OrderStatusEnum.PENDING,
          expiresAt: LessThan(new Date()),
        },
        relations: {
          items: true,
          payment: true,
        },
      });

      for (const order of pendingOrders) {
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

          if (!variant) {
            throw new NotFoundException({
              errorCode: ErrorCodeEnum.PRODUCT_VARIANT_NOT_FOUND,
              statusCode: 404,
              message: 'Variant not found',
            });
          }

          variant.reservedStock -= item.quantity;
          await manager.getRepository(ProductVariantEntity).save(variant);
        }
        order.status = OrderStatusEnum.EXPIRED;
        await manager.getRepository(OrderEntity).save(order);

        order.payment.paymentStatus = PaymentStatusEnum.CANCELLED;
        await manager.getRepository(PaymentEntity).save(order.payment);
        console.log(
          `- Cancelled order: ${order.id} with payment: ${order.payment.id}.`,
        );

        await this.redisService.publish(OrderEventEnum.ORDER_EXPIRED, {
          userId: order.userId,
          orderId: order.id,
        });
        console.log(`- Published redis event: ${OrderEventEnum.ORDER_EXPIRED}`, {
          userId: order.userId,
          orderId: order.id,
        });
      }
    });
    console.log('Cancel expired orders completed.');
  }
}
