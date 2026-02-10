import { AdminUserService } from './management/user/admin-user.service';
import { AdminUserController } from './management/user/admin-user.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/database/entities/user.entity';
import { UserRepository } from 'src/shared/modules/user/user.repository';
import { AdminBrandController } from './management/brand/admin-brand.controller';
import { AdminBrandService } from './management/brand/admin-brand.service';
import { BrandRepository } from 'src/shared/modules/common-brand/brand.repository';
import { CategoryRepository } from 'src/shared/modules/common-category/category.repository';
import { ProductRepository } from 'src/shared/modules/common-product/product.repository';
import { ProductVariantRepository } from 'src/shared/modules/common-product-variant/product-variant.repository';
import { OrderItemRepository } from '../order/repository/order-item.repository';
import { OrderRepository } from 'src/shared/modules/common-order/order.repository';
import { PaymentRepository } from '../payment/repository/payment.repository';
import { AdminCategoryService } from './management/category/admin-category.service';
import { AdminOrderService } from './management/order/admin-order.service';
import { AdminPaymentService } from './management/payment/admin-payment.service';
import { AdminProductService } from './management/product/admin-product.service';
import { AdminProductVariantService } from './management/product-variant/admin-variant.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [
    // repositories
    UserRepository,
    BrandRepository,
    CategoryRepository,
    ProductRepository,
    ProductVariantRepository,
    OrderItemRepository,
    OrderRepository,
    PaymentRepository,

    //services
    AdminUserService, 
    AdminBrandService,
    AdminCategoryService,
    AdminOrderService,
    AdminPaymentService,
    AdminProductService,
    AdminProductVariantService,
  ],
  controllers: [AdminUserController, AdminBrandController],
})
export class AdminModule {}
