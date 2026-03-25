// login => create order => confirm payment
// login => create order => cancel order

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';
import { clearDatabase } from './utils/clear-database.util';
import { UserRepository } from 'src/shared/modules/common-user/user.repository';
import { ProductVariantRepository } from 'src/shared/modules/common-product-variant/product-variant.repository';
import { OrderRepository } from 'src/shared/modules/common-order/order.repository';
import { ProductRepository } from 'src/shared/modules/common-product/product.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from 'src/database/entities/user.entity';
import { ProductVariantEntity } from 'src/database/entities/product-variant.entity';
import { PaymentRepository } from 'src/shared/modules/common-payment/payment.repository';
import { seedTestData } from './utils/seed-test-data.util';
import * as request from 'supertest';
import { PaymentStatusEnum } from 'src/shared/enums/payment.enum';
import {
  OrderPaymentStatusEnum,
  OrderStatusEnum,
} from 'src/shared/enums/order.enum';

describe('Order E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let seededData: Awaited<ReturnType<typeof seedTestData>>;

  let userRepository: UserRepository;
  let productRepository: ProductRepository;
  let productVariantRepository: ProductVariantRepository;
  let orderRepository: OrderRepository;
  let paymentRepository: PaymentRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    dataSource = moduleRef.get(DataSource);

    userRepository = moduleRef.get(getRepositoryToken(UserEntity));
    productRepository = moduleRef.get(getRepositoryToken(ProductRepository));
    productVariantRepository = moduleRef.get(ProductVariantRepository);
    orderRepository = moduleRef.get(getRepositoryToken(OrderRepository));
    paymentRepository = moduleRef.get(getRepositoryToken(PaymentRepository));

    await app.init();
  });
  beforeEach(async () => {
    await clearDatabase(dataSource);
    seededData = await seedTestData(dataSource);
  });

  it('should create and pay an order successfully', async () => {
    // Force payment confirmation success to keep the test deterministic.
    jest.spyOn(Math, 'random').mockReturnValue(0.9);

    const { variants } = seededData;

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@mail.com',
        password: '123456',
      });

    const token = loginRes.body.accessToken;

    const orderRes = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [
          {
            variantId: variants[1].id,
            quantity: 5,
          },
        ],
      });
    expect(orderRes.status).toBe(201);

    const paymentId = orderRes.body.data.paymentId;
    const orderId = orderRes.body.data.id;
    
    const paymentRes = await request(app.getHttpServer())
    .post(`/payments/confirm/${paymentId}`)
    .set('Authorization', `Bearer ${token}`)

    expect(paymentRes.status).toBe(201);

    const finalOrder = await orderRepository.findById(orderId)
    expect(finalOrder?.status).toBe(OrderStatusEnum.COMPLETED);
    expect(finalOrder?.paymentStatus).toBe(OrderPaymentStatusEnum.PAID);

    const variant = await productVariantRepository.findById(variants[1].id);
    expect(variant?.reservedStock).toBe(0);
    expect(variant?.stock).toBe(35);
  });

  afterAll(async () => {
    await app.close();
  });
});
