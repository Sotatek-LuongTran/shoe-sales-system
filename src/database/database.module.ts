import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from '../shared/modules/user/user.repository';
import { BrandEntity } from './entities/brand.entity';
import { CategoryEntity } from './entities/category.entity';
import { ProductEntity } from './entities/product.entity';
import { ProductVariantEntity } from './entities/product-variant.entity';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { PaymentEntity } from './entities/payment.entity';

// All entities should be imported here
const entities = [
  UserEntity,
  BrandEntity,
  CategoryEntity,
  ProductEntity,
  ProductVariantEntity,
  OrderEntity,
  OrderItemEntity,
  PaymentEntity,
];

// All repositories should be imported here
const repositories = [UserRepository];

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const sslConfig = configService.get<boolean>('DATABASE_SSL');

        return {
          type: 'postgres' as const,
          host: configService.get<string>('DATABASE_HOST'),
          port: configService.get<number>('DATABASE_PORT'),
          username: configService.get<string>('DATABASE_USERNAME'),
          password: configService.get<string>('DATABASE_PASSWORD'),
          database: configService.get<string>('DATABASE_NAME'),
          ssl: sslConfig === true ? { rejectUnauthorized: false } : false,
          autoLoadEntities: true,
          logging:
            configService.get<string>('DATABASE_LOGGING') === String('true'),
          entities,
          migrations: ['dist/database/migrations/*.js'],
          migrationsTableName: 'migrations',
          migrationsRun: true,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature(entities),
  ],
  providers: [...repositories],
  exports: [TypeOrmModule, ...repositories],
})
export class DatabaseModule {}
