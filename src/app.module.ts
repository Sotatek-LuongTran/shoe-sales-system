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
import { APP_FILTER } from '@nestjs/core';
import { CatchEverythingFilter } from './shared/filters/catch-everything.filter';
import { MailerModule } from './shared/modules/mailer/mailer.module';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [
    PassportModule,
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
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
    MailerModule,
  ],
  // providers: [
  //   {
  //     provide: APP_FILTER,
  //     useClass: CatchEverythingFilter,
  //   },
  // ],
})
export class AppModule {}
