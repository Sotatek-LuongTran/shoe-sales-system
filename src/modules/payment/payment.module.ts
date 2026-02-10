import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from 'src/database/entities/order.entity';
import { PaymentEntity } from 'src/database/entities/payment.entity';
import { PaymentRepository } from './repository/payment.repository';
import { OrderRepository } from '../../shared/modules/common-order/order.repository';
import { PaymentController } from './payment.controller';
import { ProductVariantRepository } from 'src/shared/modules/common-product-variant/product-variant.repository';
import { PaymentService } from './payment.service';
import { UserRepository } from 'src/shared/modules/user/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity, OrderEntity])],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentRepository,
    OrderRepository,
    ProductVariantRepository,
    UserRepository,
  ],
})
export class PaymentModule {}
