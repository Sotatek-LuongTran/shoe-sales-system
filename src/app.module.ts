import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from './modules/auth/authentication.module';
import { RedisModule } from './common/redis/redis.module';
import { ProductModule } from './modules/product/product.module';
@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule,
    AuthenticationModule,
    ProductModule,
  ],
})
export class AppModule {}
