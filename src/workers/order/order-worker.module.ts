import { Module } from '@nestjs/common';
import { OrderWorkerJob } from './order-worker.job';
import { PaymentRepository } from 'src/shared/modules/common-payment/payment.repository';
import { OrderRepository } from 'src/shared/modules/common-order/order.repository';
import { ProductVariantRepository } from 'src/shared/modules/common-product-variant/product-variant.repository';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from 'src/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from 'src/shared/modules/notifications/notification.service';
import { NotificationGateway } from 'src/shared/modules/notifications/notification.gateway';
import { RedisService } from 'src/shared/modules/redis/redis.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
  ],
  providers: [
    OrderWorkerJob,
    PaymentRepository,
    OrderRepository,
    ProductVariantRepository,
    RedisService,
  ],
})
export class OrderWorkerModule {}
