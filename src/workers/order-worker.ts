import { NestFactory } from '@nestjs/core';
import { OrderWorkerModule } from './order/order-worker.module';

async function bootstrap() {
  await NestFactory.createApplicationContext(OrderWorkerModule);
  console.log('Order worker is running ...');
}
bootstrap();
