import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from './modules/auth/authentication.module';
import { RedisModule } from './common/redis/redis.module';
import { ProductModule } from './modules/product/product.module';
import { BrandModule } from './modules/brand/brand.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductVariantModule } from './modules/product-variant/product-variant.module';
import { OrderModule } from './modules/order/order.module';
import { PaymentModule } from './modules/payment/payment.module';
import { AdminModule } from './modules/admin/admin.module';
import { UserModule } from './modules/user/user.module';
import { PassportModule } from '@nestjs/passport';
@Module({
  imports: [
    PassportModule,
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule,
    AuthenticationModule,
    ProductModule,
    BrandModule,
    CategoryModule,
    ProductVariantModule,
    OrderModule,
    PaymentModule,
    AdminModule,
    UserModule,
  ],
})
export class AppModule {}
