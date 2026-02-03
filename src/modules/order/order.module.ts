import { Module } from '@nestjs/common';
import { OrderRepository } from '../../shared/modules/common-order/order.repository';
import { OrderItemRepository } from './repository/order-item.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from 'src/database/entities/order.entity';
import { OrderItemEntity } from 'src/database/entities/order-item.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { ProductRepository } from 'src/shared/modules/common-product/product.repository';
import { ProductVariantRepository } from 'src/shared/modules/common-product-variant/product-variant.repository';
import { UserRepository } from 'src/shared/modules/user/user.repository';
import { AuthenticationModule } from '../auth/authentication.module';
import { PaymentRepository } from '../payment/repository/payment.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity]),
    AuthenticationModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderRepository,
    OrderItemRepository,
    ProductRepository,
    ProductVariantRepository,
    UserRepository,
    PaymentRepository,
  ],
})
export class OrderModule {}
